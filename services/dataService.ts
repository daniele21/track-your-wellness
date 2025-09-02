import { dbService } from './dbService';
import { DailyLog, NutritionGoals, WorkoutRoutine, WorkoutSession, BodyMeasurement, Theme, View, DEFAULT_GOALS } from '../types/index';

const KEYS = {
    THEME: 'theme',
    VIEW: 'view',
    GOALS: 'goals',
    ACTIVE_SESSION: 'activeSession',
    MIGRATION_DONE: 'migration-to-idb-complete',
};

const STORES = {
    KEYVAL: 'keyval',
    DAILY_LOGS: 'dailyLogs',
    WORKOUT_ROUTINES: 'workoutRoutines',
    WORKOUT_HISTORY: 'workoutHistory',
    BODY_MEASUREMENTS: 'bodyMeasurements',
};

export const dataService = {
    async getAllData() {
        const [
            theme, view, goals, activeSession,
            dailyLogsFromDb, workoutRoutines, workoutHistory, bodyMeasurements
        ] = await Promise.all([
            dbService.get<{value: Theme}>(STORES.KEYVAL, KEYS.THEME),
            dbService.get<{value: View}>(STORES.KEYVAL, KEYS.VIEW),
            dbService.get<{value: NutritionGoals}>(STORES.KEYVAL, KEYS.GOALS),
            dbService.get<{value: WorkoutSession | null}>(STORES.KEYVAL, KEYS.ACTIVE_SESSION),
            dbService.getAll<DailyLog & {date: string}>(STORES.DAILY_LOGS),
            dbService.getAll<WorkoutRoutine>(STORES.WORKOUT_ROUTINES),
            dbService.getAll<WorkoutSession>(STORES.WORKOUT_HISTORY),
            dbService.getAll<BodyMeasurement>(STORES.BODY_MEASUREMENTS),
        ]);
        
        const dailyLogsRecord = dailyLogsFromDb.reduce((acc, logWithDate) => {
            const { date, ...logData } = logWithDate;
            acc[date] = logData;
            return acc;
        }, {} as Record<string, DailyLog>);

        return {
            theme: theme?.value || 'dark',
            view: view?.value || 'home',
            goals: goals?.value || DEFAULT_GOALS,
            activeSession: activeSession?.value || null,
            dailyLogs: dailyLogsRecord,
            workoutRoutines,
            workoutHistory,
            bodyMeasurements,
        };
    },

    async runMigration() {
        const migrationDone = localStorage.getItem(KEYS.MIGRATION_DONE);
        if (migrationDone) return;
        
        console.log("Starting migration from localStorage to IndexedDB...");

        try {
            const keysToMigrate = ['theme', 'view', 'goals', 'activeSession', 'dailyLogs', 'workoutRoutines', 'workoutHistory', 'bodyMeasurements'];
            const promises = keysToMigrate.map(key => {
                const item = localStorage.getItem(key);
                if (!item) return Promise.resolve();
                
                try {
                    const data = JSON.parse(item);
                    
                    switch(key) {
                        case 'theme': return dbService.set(STORES.KEYVAL, { key: KEYS.THEME, value: data });
                        case 'view': return dbService.set(STORES.KEYVAL, { key: KEYS.VIEW, value: data });
                        case 'goals': return dbService.set(STORES.KEYVAL, { key: KEYS.GOALS, value: data });
                        case 'activeSession': return dbService.set(STORES.KEYVAL, { key: KEYS.ACTIVE_SESSION, value: data });
                        case 'dailyLogs': {
                            return Promise.all(Object.entries(data).map(([date, log]) => 
                                dbService.set(STORES.DAILY_LOGS, { date, ...(log as object) })
                            ));
                        }
                        case 'workoutRoutines': 
                        case 'workoutHistory': 
                        case 'bodyMeasurements': {
                            if (Array.isArray(data)) {
                                const storeName = key === 'workoutRoutines' ? STORES.WORKOUT_ROUTINES : key === 'workoutHistory' ? STORES.WORKOUT_HISTORY : STORES.BODY_MEASUREMENTS;
                                return Promise.all(data.map(entry => dbService.set(storeName, entry)));
                            }
                            return Promise.resolve();
                        }
                        default: return Promise.resolve();
                    }
                } catch (e) {
                    console.error(`Failed to parse or migrate localStorage key: ${key}`, e);
                    return Promise.resolve();
                }
            });

            await Promise.all(promises);
            localStorage.setItem(KEYS.MIGRATION_DONE, 'true');
            console.log("Migration successful.");
        } catch (error) {
            console.error("Migration failed:", error);
        }
    },
    
    saveTheme: (theme: Theme) => dbService.set(STORES.KEYVAL, { key: KEYS.THEME, value: theme }),
    saveView: (view: View) => dbService.set(STORES.KEYVAL, { key: KEYS.VIEW, value: view }),
    saveGoals: (goals: NutritionGoals) => dbService.set(STORES.KEYVAL, { key: KEYS.GOALS, value: goals }),
    saveActiveSession: (session: WorkoutSession | null) => dbService.set(STORES.KEYVAL, { key: KEYS.ACTIVE_SESSION, value: session }),

    saveDailyLog: (log: DailyLog, date: string) => dbService.set(STORES.DAILY_LOGS, { date, ...log }),
    
    saveWorkoutRoutines: async (routines: WorkoutRoutine[]) => {
        await dbService.clear(STORES.WORKOUT_ROUTINES);
        if (routines && routines.length > 0) {
            await Promise.all(routines.map(r => dbService.set(STORES.WORKOUT_ROUTINES, r)));
        }
    },
        
    deleteWorkoutRoutine: (id: string) => dbService.delete(STORES.WORKOUT_ROUTINES, id),
    
    addWorkoutToHistory: (session: WorkoutSession) => dbService.set(STORES.WORKOUT_HISTORY, session),
    updateWorkoutInHistory: (session: WorkoutSession) => dbService.set(STORES.WORKOUT_HISTORY, session),
    deleteWorkoutFromHistory: (id: string) => dbService.delete(STORES.WORKOUT_HISTORY, id),
    
    saveBodyMeasurement: (measurement: BodyMeasurement) => dbService.set(STORES.BODY_MEASUREMENTS, measurement),
    deleteBodyMeasurement: (date: string) => dbService.delete(STORES.BODY_MEASUREMENTS, date),
};