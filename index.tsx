
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { logError, logInfo } from './views/loggingService';
import { dataService } from './services/dataService';

import { formatDate, generateUniqueId, parseTargetReps } from './types/utils/helpers';
import { View, Theme, DailyLog, NutritionGoals, WorkoutRoutine, WorkoutSession, FoodItem, MealType, DEFAULT_GOALS, LoggedSet, BodyMeasurement } from './types/index';

import { Header } from './components/Header';
import { DateNavigator } from './components/DateNavigator';
import { BottomNav } from './components/BottomNav';
import { AddMealModal } from './components/AddMealModal';
import { AddMeasurementModal } from './components/AddMeasurementModal';
import { EditFoodItemModal } from './components/EditFoodItemModal';

import { HomeView } from './views/HomeView';
import { PastiView } from './views/PastiView';
import { AllenamentoView } from './views/AllenamentoView';
import { StatsView } from './views/StatsView';
import { ProfileView } from './views/ProfileView';
import { ActiveWorkoutSession } from './views/ActiveWorkoutSession';
import { EditWorkoutSessionView } from './views/EditWorkoutSessionView';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<View>('home');
    const [theme, setTheme] = useState<Theme>('dark');
    
    // --- App Data State (now from component state) ---
    const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>({});
    const [goals, setGoals] = useState<NutritionGoals>(DEFAULT_GOALS);
    const [workoutRoutines, setWorkoutRoutines] = useState<WorkoutRoutine[]>([]);
    const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
    const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
    const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
    const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isAddMealModalOpen, setAddMealModalOpen] = useState(false);
    const [measurementModalState, setMeasurementModalState] = useState<{ measurement?: BodyMeasurement, date: string } | null>(null);
    const [editingFoodItem, setEditingFoodItem] = useState<{ mealType: MealType; itemIndex: number; item: FoodItem } | null>(null);


    // --- Data Loading and Migration Effect ---
    useEffect(() => {
        const loadData = async () => {
            try {
                await dataService.runMigration();
                const data = await dataService.getAllData();
                setTheme(data.theme);
                setView(data.view);
                setGoals(data.goals);
                setActiveSession(data.activeSession);
                setDailyLogs(data.dailyLogs);
                setWorkoutRoutines(data.workoutRoutines);
                setWorkoutHistory(data.workoutHistory);
                setBodyMeasurements(data.bodyMeasurements);

                // Migration for view name change from 'stats' to 'misure'
                if ((data.view as string) === 'stats') {
                    handleSetView('misure');
                }

            } catch (error) {
                logError(error, { action: 'loadAllData' });
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);
    
    const currentLog = dailyLogs[formatDate(currentDate)] || null;
    
    // --- Data Handlers (now async with IndexedDB) ---

    const handleSetTheme = async (newTheme: Theme) => {
        await dataService.saveTheme(newTheme);
        setTheme(newTheme);
    };

    const handleSetView = async (newView: View) => {
        await dataService.saveView(newView);
        setView(newView);
    };
    
    const handleAddMeal = async (mealType: MealType, items: FoodItem[]) => {
        const dateKey = formatDate(currentDate);
        const logForDate = dailyLogs[dateKey] || {};
        const newMealItems = [...(logForDate[mealType] || []), ...items];
        const newLog = { ...logForDate, [mealType]: newMealItems };

        await dataService.saveDailyLog(newLog, dateKey);

        const newDailyLogs = { ...dailyLogs, [dateKey]: newLog };
        setDailyLogs(newDailyLogs);
        logInfo('Meal added.', { mealType, itemCount: items.length });
    };
    
    const handleDeleteFood = async (mealType: MealType, itemIndex: number) => {
        const dateKey = formatDate(currentDate);
        const logForDate = dailyLogs[dateKey];
        if (!logForDate?.[mealType]) return;

        const newLog = { ...logForDate };
        newLog[mealType]!.splice(itemIndex, 1);
        
        await dataService.saveDailyLog(newLog, dateKey);

        const newDailyLogs = { ...dailyLogs, [dateKey]: newLog };
        setDailyLogs(newDailyLogs);
        logInfo('Food item deleted.', { mealType, itemIndex });
    };
    
    const handleOpenEditFoodModal = (mealType: MealType, itemIndex: number) => {
        const dateKey = formatDate(currentDate);
        const item = dailyLogs[dateKey]?.[mealType]?.[itemIndex];
        if (item) {
            setEditingFoodItem({ mealType, itemIndex, item });
        }
    };

    const handleCloseEditFoodModal = () => setEditingFoodItem(null);

    const handleUpdateFoodItem = async (updatedItem: FoodItem) => {
        if (!editingFoodItem) return;
        const { mealType, itemIndex } = editingFoodItem;
        const dateKey = formatDate(currentDate);
        const logForDate = { ...dailyLogs[dateKey] };
        
        if (!logForDate?.[mealType]) return;

        const newMealItems = [...logForDate[mealType]!];
        newMealItems[itemIndex] = updatedItem;
        const newLog = { ...logForDate, [mealType]: newMealItems };

        await dataService.saveDailyLog(newLog, dateKey);
        setDailyLogs(prev => ({ ...prev, [dateKey]: newLog }));
        handleCloseEditFoodModal();
    };

    const handleUpdateGoals = async (newGoals: NutritionGoals) => {
        await dataService.saveGoals(newGoals);
        setGoals(newGoals);
        logInfo('Goals updated.');
    };

    const handleSaveRoutines = async (newRoutines: WorkoutRoutine[]) => {
        await dataService.saveWorkoutRoutines(newRoutines);
        setWorkoutRoutines(newRoutines);
        logInfo('Routines saved.', { routineCount: newRoutines.length });
    };

    const handleUpdateActiveSession = async (session: WorkoutSession | null) => {
        await dataService.saveActiveSession(session);
        setActiveSession(session);
         if (session) {
            logInfo('Active session updated.', { routineName: session.routineName });
        } else {
            logInfo('Active session cleared.');
        }
    };
    
    const handleStartWorkout = (routine: WorkoutRoutine) => {
        const lastSessionForRoutine = [...workoutHistory]
            .reverse()
            .find(session => session.routineId === routine.id);

        const newSession: WorkoutSession = {
            id: generateUniqueId(),
            date: formatDate(new Date()),
            routineId: routine.id,
            routineName: routine.name,
            exercises: (routine.exercises || []).map(ex => {
                const lastExerciseLog = lastSessionForRoutine?.exercises.find(
                    loggedEx => loggedEx.exerciseId === ex.id
                );
                
                const sets: (LoggedSet | null)[] = Array(ex.sets).fill(null).map((_, setIndex) => {
                     const lastSet = lastExerciseLog?.sets[setIndex];
                     return {
                         weight: lastSet?.weight || 0,
                         reps: parseTargetReps(ex.reps),
                     };
                });

                return {
                    exerciseId: ex.id,
                    name: ex.name,
                    targetSets: ex.sets,
                    targetReps: ex.reps,
                    sets: sets,
                    notes: ex.notes,
                };
            }),
            duration: 0,
        };
        handleUpdateActiveSession(newSession); // Persists and sets state
        logInfo('Workout started.', { routineName: routine.name });
    };

    const handleFinishWorkout = async (session: WorkoutSession) => {
        await dataService.addWorkoutToHistory(session);
        await dataService.saveActiveSession(null);

        const newHistory = [...workoutHistory, session];
        setWorkoutHistory(newHistory);
        setActiveSession(null);
        logInfo('Workout finished.', { routineName: session.routineName, duration: session.duration });
    };
    
    const handleStartEditWorkout = (session: WorkoutSession) => {
        setEditingSession(session);
    };
    const handleCancelEditWorkout = () => {
        setEditingSession(null);
    };
    const handleDeleteWorkout = async (sessionId: string) => {
        if (window.confirm("Sei sicuro di voler eliminare questa sessione di allenamento?")) {
            await dataService.deleteWorkoutFromHistory(sessionId);
            setWorkoutHistory(prev => prev.filter(s => s.id !== sessionId));
        }
    };
    const handleSaveWorkout = async (updatedSession: WorkoutSession) => {
        await dataService.updateWorkoutInHistory(updatedSession);
        setWorkoutHistory(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
        setEditingSession(null);
    };

    const handleAddMeasurement = async (measurement: Omit<BodyMeasurement, 'date'>, date: string) => {
        const dateKey = date;
        const newMeasurementEntry: BodyMeasurement = { ...measurement, date: dateKey };
        
        await dataService.saveBodyMeasurement(newMeasurementEntry);
        
        const existingIndex = bodyMeasurements.findIndex(m => m.date === dateKey);
        let newMeasurements;
        if (existingIndex > -1) {
            newMeasurements = [...bodyMeasurements];
            newMeasurements[existingIndex] = newMeasurementEntry;
        } else {
            newMeasurements = [...bodyMeasurements, newMeasurementEntry];
        }
        
        newMeasurements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setBodyMeasurements(newMeasurements);
        logInfo('Body measurement saved.', { date: dateKey, weight: measurement.weight });
    };

    const handleDeleteMeasurement = async (date: string) => {
        if (window.confirm("Sei sicuro di voler eliminare questa misurazione?")) {
            await dataService.deleteBodyMeasurement(date);
            const newMeasurements = bodyMeasurements.filter(m => m.date !== date);
            setBodyMeasurements(newMeasurements);
            logInfo('Body measurement deleted.', { date });
        }
    };
    
    const handleOpenMeasurementModal = (date: string = formatDate(new Date())) => {
        const measurement = bodyMeasurements.find(m => m.date === date);
        setMeasurementModalState({ measurement, date });
    };

    const handleCloseMeasurementModal = () => {
        setMeasurementModalState(null);
    };

    const renderView = () => {
        switch (view) {
            case 'home':
                return <HomeView 
                            dailyLog={currentLog} 
                            goals={goals} 
                            currentDate={currentDate} 
                            setCurrentDate={setCurrentDate}
                            setView={handleSetView}
                            onAddMeal={() => setAddMealModalOpen(true)}
                            workoutHistory={workoutHistory}
                            bodyMeasurements={bodyMeasurements}
                            onOpenMeasurementModal={handleOpenMeasurementModal}
                        />;
            case 'pasti':
                return <PastiView 
                            dailyLog={currentLog} 
                            currentDate={currentDate} 
                            setCurrentDate={setCurrentDate} 
                            onAddMealClick={() => setAddMealModalOpen(true)}
                            onDeleteFood={handleDeleteFood}
                            onEditFood={handleOpenEditFoodModal}
                        />;
            case 'allenamento':
                 return <AllenamentoView 
                            routines={workoutRoutines} 
                            history={workoutHistory} 
                            onSaveRoutines={handleSaveRoutines}
                            onStartWorkout={handleStartWorkout}
                            onEditSession={handleStartEditWorkout}
                            onDeleteSession={handleDeleteWorkout}
                        />;
            case 'misure':
            case 'analisi':
                 return <StatsView 
                            dailyLogs={dailyLogs} 
                            theme={theme}
                            bodyMeasurements={bodyMeasurements}
                            onOpenMeasurementModal={handleOpenMeasurementModal}
                            onDeleteMeasurement={handleDeleteMeasurement}
                            activeTab={view}
                        />;
            case 'profile':
                return <ProfileView 
                            goals={goals} 
                            onUpdateGoals={handleUpdateGoals} 
                            dailyLog={dailyLogs[formatDate(new Date())] || null}
                            theme={theme}
                            onSetTheme={handleSetTheme}
                        />;
            default:
                return <HomeView 
                            dailyLog={currentLog} 
                            goals={goals} 
                            currentDate={currentDate} 
                            setCurrentDate={setCurrentDate}
                            setView={handleSetView}
                            onAddMeal={() => setAddMealModalOpen(true)}
                            workoutHistory={workoutHistory}
                            bodyMeasurements={bodyMeasurements}
                            onOpenMeasurementModal={handleOpenMeasurementModal}
                        />;
        }
    };
    
    const getHeaderContent = () => {
        let title: string | React.ReactNode = 'Diario AI';
        let actions: React.ReactNode | null = null;
    
        switch (view) {
            case 'home':
            case 'pasti':
                title = <DateNavigator currentDate={currentDate} setCurrentDate={setCurrentDate} />;
                break;
            case 'allenamento':
                title = "Allenamento";
                break;
            case 'misure':
                 title = "Misure Corporee";
                 break;
            case 'analisi':
                 title = "Analisi";
                 break;
            case 'profile':
                title = "Profilo e Impostazioni";
                break;
        }
        return { title, actions };
    };

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a202c', color: '#e2e8f0' }}>Caricamento...</div>;
    }

    if (editingSession) {
        return <EditWorkoutSessionView session={editingSession} onSave={handleSaveWorkout} onCancel={handleCancelEditWorkout} />;
    }

    if (activeSession) {
        return (
            <ActiveWorkoutSession 
                session={activeSession}
                onUpdateSession={handleUpdateActiveSession}
                onFinishSession={handleFinishWorkout}
            />
        );
    }
    
    const { title, actions } = getHeaderContent();

    return (
        <>
            <Header 
                title={title}
                actions={actions}
                onLogoClick={view !== 'home' ? () => handleSetView('home') : undefined}
            />
            <main className="main-content">
                {renderView()}
            </main>
            <BottomNav activeView={view} setView={handleSetView} />

            <AddMealModal
                isOpen={isAddMealModalOpen}
                onClose={() => setAddMealModalOpen(false)}
                onAddMeal={handleAddMeal}
            />
            <EditFoodItemModal
                isOpen={!!editingFoodItem}
                onClose={handleCloseEditFoodModal}
                onSave={handleUpdateFoodItem}
                foodItem={editingFoodItem?.item ?? null}
            />
            <AddMeasurementModal 
                isOpen={!!measurementModalState}
                onClose={handleCloseMeasurementModal}
                onSave={handleAddMeasurement}
                initialData={measurementModalState}
            />
        </>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}