
import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem, WorkoutRoutine, NutritionGoals, ExerciseDefinition } from '../types/index';
import { logError } from '../views/loggingService';

const API_KEY = process.env.API_KEY;

// Validate API key is present
if (!API_KEY) {
    console.error('GEMINI_API_KEY is not configured. Please add it to your .env.local file.');
    throw new Error('Gemini API key is required. Please check your environment configuration.');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeMealWithGemini = async (description: string): Promise<FoodItem[]> => {
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
    const model = "gemini-2.5-flash";
    const goalsString = (Object.keys(goals) as Array<keyof NutritionGoals>)
        .filter(key => goals[key].enabled)
        .map(key => `${key}: ${goals[key].value}${key === 'kcal' ? '' : 'g'}`)
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
