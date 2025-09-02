
import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem, WorkoutRoutine, NutritionGoals, ExerciseDefinition, WorkoutSession, DailyLog, Goal } from '../types/index';
import { logError } from '../views/loggingService';
import { authService } from './authService';

const API_KEY = process.env.API_KEY;

// Validate API key is present
if (!API_KEY) {
    console.error('GEMINI_API_KEY is not configured. Please add it to your .env.local file.');
    throw new Error('Gemini API key is required. Please check your environment configuration.');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Authentication check wrapper
const requireAuth = async (): Promise<void> => {
    if (!authService.isAuthenticated()) {
        throw new Error('Authentication required. Please sign in to use AI features.');
    }
    
    if (!authService.isAuthorized()) {
        throw new Error('Access denied. Your account is not authorized to use AI features.');
    }
};

export const analyzeMealWithGemini = async (description: string): Promise<FoodItem[]> => {
    // Check authentication before making API call
    await requireAuth();
    
    const model = "gemini-2.5-flash";
    const schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Nome dell'alimento, es. 'Mela' o 'Pasta al pomodoro'" },
            kcal: { type: Type.NUMBER, description: "Calorie stimate (kcal)" },
            carbs: { type: Type.NUMBER, description: "Carboidrati stimati (g)" },
            protein: { type: Type.NUMBER, description: "Proteine stimate (g)" },
            fats: { type: Type.NUMBER, description: "Grassi stimati (g)" },
            fiber: { type: Type.NUMBER, description: "Fibre stimate (g)" }
          },
          required: ["name", "kcal", "carbs", "protein", "fats", "fiber"]
        }
    };

    const prompt = `Sei un esperto nutrizionista. Analizza la seguente descrizione di un pasto fornita da un utente. Estrai ogni singolo alimento, stima le quantità se non specificate, e calcola i valori nutrizionali (calorie, carboidrati, proteine, grassi, fibre). Rispondi SOLO con un array JSON valido basato sullo schema fornito. Descrizione pasto: "${description}"`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const parsedJson = JSON.parse(response.text);

        if (!Array.isArray(parsedJson)) {
            console.error("Gemini API did not return a valid array for meal analysis:", parsedJson);
            throw new Error("La risposta dell'AI non era nel formato previsto. Riprova.");
        }

        // Sanitize each item to ensure it has valid data and prevent NaN issues
        const validatedItems = parsedJson
            .filter(Boolean) // Filter out any null/undefined entries
            .map(item => ({
                name: String(item.name || 'Alimento Sconosciuto'),
                kcal: Number(item.kcal) || 0,
                carbs: Number(item.carbs) || 0,
                protein: Number(item.protein) || 0,
                fats: Number(item.fats) || 0,
                fiber: Number(item.fiber) || 0,
            }));

        return validatedItems;

    } catch (error) {
        console.error("Errore durante la chiamata a Gemini API:", error);
        logError(error, { action: 'analyzeMealWithGemini', description });
         if (error instanceof Error && error.message.includes("formato previsto")) {
            throw error;
        }
        throw new Error("Non è stato possibile analizzare il pasto. Riprova.");
    }
};

export const analyzeRoutinesWithGemini = async (text: string): Promise<Omit<WorkoutRoutine, 'id'>[]> => {
    // Check authentication before making API call
    await requireAuth();
    
    const model = "gemini-2.5-flash";
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "Il nome della scheda di allenamento, es. 'Giorno Spinta A'" },
                description: { type: Type.STRING, description: "Una breve descrizione della scheda, se presente." },
                exercises: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Nome dell'esercizio, es. 'Panca Piana'" },
                            sets: { type: Type.NUMBER, description: "Il numero di serie" },
                            reps: { type: Type.STRING, description: "Le ripetizioni target, es. '8-12' o '10'" },
                            notes: { type: Type.STRING, description: "Eventuali note sull'esercizio." }
                        },
                        required: ["name", "sets", "reps"]
                    }
                }
            },
            required: ["name", "exercises"]
        }
    };

    const prompt = `Sei un esperto di fitness. Analizza il seguente testo che contiene una o più schede di allenamento. Estrai il nome di ogni scheda, una sua eventuale descrizione, e per ogni scheda la lista degli esercizi con nome, numero di serie, ripetizioni (come stringa, es. "8-12" o "10"), e note. Ignora eventuali informazioni non pertinenti. Rispondi SOLO con un array JSON valido basato sullo schema fornito. Testo: "${text}"`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const parsedJson = JSON.parse(response.text);
        
        if (!Array.isArray(parsedJson)) {
            console.error("Gemini API did not return a valid array for routine analysis:", parsedJson);
            throw new Error("La risposta dell'AI non era nel formato previsto. Riprova.");
        }

        // Sanitize the response to prevent errors from malformed data
        const sanitizedRoutines = parsedJson
            .filter(Boolean) // Filter out any null/undefined routines
            .map((routine: any) => ({
                name: String(routine.name || 'Scheda senza Nome'),
                description: String(routine.description || ''),
                // Ensure exercises is always an array and contains no nulls
                exercises: (routine.exercises && Array.isArray(routine.exercises) ? routine.exercises : [])
                    .filter(Boolean) // Filter out any null/undefined exercises
                    .map((ex: any) => ({
                        name: String(ex.name || 'Esercizio senza Nome'),
                        sets: Number(ex.sets) || 3,
                        reps: String(ex.reps || '8-12'),
                        notes: String(ex.notes || ''),
                    })),
            }));
        
        return sanitizedRoutines as Omit<WorkoutRoutine, 'id'>[];

    } catch (error) {
        console.error("Errore durante l'importazione con Gemini:", error);
        logError(error, { action: 'analyzeRoutinesWithGemini', textLength: text.length });
         if (error instanceof Error && error.message.includes("formato previsto")) {
            throw error;
        }
        throw new Error("Non è stato possibile importare le schede. Controlla il testo e riprova.");
    }
};

export const getDailyTipWithGemini = async (goals: NutritionGoals): Promise<string> => {
    // Check authentication before making API call
    await requireAuth();
    
    const model = "gemini-2.5-flash";
    const goalsString = (Object.keys(goals) as Array<keyof NutritionGoals>)
        .filter(key => key !== 'workoutGoalDescription' && (goals[key] as Goal).enabled)
        .map(key => `${key}: ${(goals[key] as Goal).value}${key === 'kcal' ? '' : 'g'}`)
        .join(', ');

    const prompt = `Sei un coach motivazionale di fitness e nutrizione. Basandoti sugli obiettivi dell'utente (${goalsString}), fornisci un consiglio breve, utile e motivazionale per la giornata (massimo 2-3 frasi). Varia i consigli ogni giorno. Esempio: "Ricorda di idratarti bene oggi! L'acqua è fondamentale per i tuoi obiettivi di fitness." Oppure: "Un piccolo spuntino proteico nel pomeriggio può aiutarti a raggiungere il tuo target di proteine e a mantenerti sazio." Rispondi solo con il testo del consiglio.`;

    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Errore durante la generazione del consiglio:", error);
        logError(error, { action: 'getDailyTipWithGemini', goals });
        return "Ricorda di dare sempre il massimo e di ascoltare il tuo corpo.";
    }
};

export const generateShoppingListWithGemini = async (items: FoodItem[]): Promise<string> => {
    // Check authentication before making API call
    await requireAuth();
    
    const model = "gemini-2.5-flash";
    const itemsString = items.map(item => item.name).join(', ');
    
    if (!itemsString) {
        return "Nessun alimento registrato per oggi.";
    }

    const prompt = `Sei un assistente per la spesa. Basandoti sulla seguente lista di alimenti consumati oggi, crea una semplice lista della spesa. Raggruppa gli articoli simili per categoria (es. Frutta, Verdura, Latticini, Carne, ecc.). Non includere le quantità. Rispondi solo con la lista, con ogni articolo su una nuova riga e le categorie in maiuscolo. Alimenti: ${itemsString}`;

    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Errore durante la generazione della lista della spesa:", error);
        logError(error, { action: 'generateShoppingListWithGemini', itemCount: items.length });
        throw new Error("Impossibile generare la lista della spesa.");
    }
};

export const analyzeWorkoutPlanWithGemini = async (
    routines: WorkoutRoutine[], 
    workoutSessions: WorkoutSession[], 
    goals: NutritionGoals
): Promise<string> => {
    // Check authentication before making API call
    await requireAuth();
    
    const model = "gemini-2.5-flash";
    
    // Prepara i dati delle routine
    const routinesData = routines.map(routine => ({
        name: routine.name,
        description: routine.description,
        exercises: routine.exercises.map(ex => `${ex.name} ${ex.sets}x${ex.reps}`)
    }));
    
    // Prepara i dati delle sessioni recenti (ultime 4 settimane)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const recentSessions = workoutSessions
        .filter(session => new Date(session.date) >= fourWeeksAgo)
        .map(session => ({
            date: session.date,
            routineName: session.routineName,
            duration: Math.round(session.duration / 60), // converti in minuti
            exercises: session.exercises.length
        }));
    
    const workoutGoal = goals.workoutGoalDescription || "Obiettivo non specificato";
    const weeklyTarget = goals.weeklyWorkouts.enabled ? goals.weeklyWorkouts.value : "Non specificato";
    
    const prompt = `Sei un personal trainer esperto. Analizza il piano di allenamento dell'utente e fornisci una valutazione costruttiva e consigli specifici.

OBIETTIVO UTENTE: ${workoutGoal}
TARGET ALLENAMENTI SETTIMANALI: ${weeklyTarget}

SCHEDE DISPONIBILI:
${routinesData.map(r => `- ${r.name}: ${r.description}\n  Esercizi: ${r.exercises.join(', ')}`).join('\n')}

ALLENAMENTI RECENTI (ultime 4 settimane):
${recentSessions.length > 0 ? 
    recentSessions.map(s => `- ${s.date}: ${s.routineName} (${s.duration} min, ${s.exercises} esercizi)`).join('\n') : 
    'Nessun allenamento registrato nelle ultime 4 settimane'
}

Fornisci una valutazione in 3-4 paragrafi che includa:
1. Valutazione della coerenza tra routine e obiettivi
2. Analisi della frequenza e consistenza degli allenamenti
3. Consigli specifici per migliorare (esercizi, frequenza, programmazione)
4. Suggerimenti motivazionali personalizzati

Usa un tono professionale ma incoraggiante. Massimo 300 parole.`;

    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Errore durante l'analisi del piano di allenamento:", error);
        logError(error, { action: 'analyzeWorkoutPlanWithGemini' });
        throw new Error("Impossibile analizzare il piano di allenamento. Riprova più tardi.");
    }
};

export const analyzeMealPlanWithGemini = async (
    dailyLogs: { [date: string]: DailyLog },
    workoutSessions: WorkoutSession[],
    goals: NutritionGoals
): Promise<string> => {
    // Check authentication before making API call
    await requireAuth();
    
    const model = "gemini-2.5-flash";
    
    // Analizza i pasti delle ultime 2 settimane
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const recentDates = Object.keys(dailyLogs)
        .filter(date => new Date(date) >= twoWeeksAgo)
        .sort()
        .slice(-14); // ultime 2 settimane
    
    // Calcola i totali giornalieri
    const dailyTotals = recentDates.map(date => {
        const log = dailyLogs[date];
        if (!log) return null;
        
        const allItems: FoodItem[] = [];
        (Object.values(log) as FoodItem[][]).forEach(meal => {
            if (meal) allItems.push(...meal);
        });
        
        return {
            date,
            kcal: allItems.reduce((sum, item) => sum + item.kcal, 0),
            protein: allItems.reduce((sum, item) => sum + item.protein, 0),
            carbs: allItems.reduce((sum, item) => sum + item.carbs, 0),
            fats: allItems.reduce((sum, item) => sum + item.fats, 0)
        };
    }).filter(Boolean);
    
    // Analizza gli allenamenti recenti
    const recentWorkouts = workoutSessions
        .filter(session => new Date(session.date) >= twoWeeksAgo)
        .length;
    
    const avgKcal = dailyTotals.length > 0 ? 
        Math.round(dailyTotals.reduce((sum, day) => sum + day!.kcal, 0) / dailyTotals.length) : 0;
    const avgProtein = dailyTotals.length > 0 ? 
        Math.round(dailyTotals.reduce((sum, day) => sum + day!.protein, 0) / dailyTotals.length) : 0;
    
    const workoutGoal = goals.workoutGoalDescription || "Obiettivo non specificato";
    
    const prompt = `Sei un nutrizionista sportivo esperto. Analizza l'alimentazione dell'utente e fornisci consigli personalizzati.

OBIETTIVI NUTRIZIONALI:
- Calorie: ${goals.kcal.enabled ? goals.kcal.value : 'Non specificato'} kcal
- Proteine: ${goals.protein.enabled ? goals.protein.value : 'Non specificato'} g
- Carboidrati: ${goals.carbs.enabled ? goals.carbs.value : 'Non specificato'} g
- Grassi: ${goals.fats.enabled ? goals.fats.value : 'Non specificato'} g

OBIETTIVO ALLENAMENTO: ${workoutGoal}

DATI RECENTI (ultime 2 settimane):
- Media calorie giornaliere: ${avgKcal} kcal
- Media proteine giornaliere: ${avgProtein} g
- Allenamenti completati: ${recentWorkouts}
- Giorni con dati: ${dailyTotals.length}/14

Fornisci una valutazione in 3-4 paragrafi che includa:
1. Confronto tra intake attuale e obiettivi
2. Coerenza tra alimentazione e obiettivi di allenamento
3. Consigli specifici per miglioramenti (timing, macronutrienti, idratazione)
4. Suggerimenti pratici per i prossimi giorni

Usa un tono professionale ma incoraggiante. Massimo 300 parole.`;

    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Errore durante l'analisi del piano alimentare:", error);
        logError(error, { action: 'analyzeMealPlanWithGemini' });
        throw new Error("Impossibile analizzare il piano alimentare. Riprova più tardi.");
    }
};
