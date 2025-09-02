

import { db, firebase } from '../types/utils/firebase';
import 'firebase/compat/firestore';
import { DailyLog, NutritionGoals, WorkoutRoutine, WorkoutSession, DEFAULT_GOALS } from '../types/index';

// Type for the entire user data document
interface UserData {
    goals: NutritionGoals;
    workoutRoutines: WorkoutRoutine[];
    workoutHistory: WorkoutSession[];
    activeSession: WorkoutSession | null;
    dailyLogs: Record<string, DailyLog>;
}

const getUserDocRef = (userId: string) => db.collection('users').doc(userId);

/**
 * Fetches user data from Firestore. If the user is new, creates an initial document.
 * @param userId - The user's unique ID from Firebase Auth.
 * @returns A promise that resolves to the user's data.
 */
export const getUserData = async (userId: string): Promise<UserData> => {
    const userDocRef = getUserDocRef(userId);
    const userDocSnap = await userDocRef.get();

    if (userDocSnap.exists) {
        const data = userDocSnap.data() as Partial<UserData>;
        
        // --- Bulletproof Sanitization ---

        // Sanitize active session
        const activeSession = data.activeSession || null;
        if (activeSession) {
            activeSession.exercises = (activeSession.exercises || [])
                .filter(Boolean) // Remove any null/undefined entries in the exercises array
                .map(exercise => ({
                    ...exercise,
                    sets: exercise.sets || [], // Ensure every exercise has a sets array
                }));
        }

        // Sanitize workout history
        const workoutHistory = (data.workoutHistory || [])
            .filter(Boolean) // Remove any null/undefined sessions
            .map(session => ({
                ...session,
                exercises: (session.exercises || [])
                    .filter(Boolean) // Remove any null/undefined exercises
                    .map(exercise => ({
                        ...exercise,
                        sets: exercise.sets || [], // Ensure every exercise has a sets array
                    })),
            }));

        // Sanitize workout routines
        const workoutRoutines = (data.workoutRoutines || [])
            .filter(Boolean) // Remove any null/undefined routines
            .map(routine => ({
                ...routine,
                exercises: (routine.exercises || []).filter(Boolean), // Ensure exercises is an array and contains no nulls
            }));
        
        return {
            goals: data.goals || DEFAULT_GOALS,
            workoutRoutines,
            workoutHistory,
            activeSession,
            dailyLogs: data.dailyLogs || {},
        };

    } else {
        // Create and return the initial document for a new user
        const initialData: UserData = {
            goals: DEFAULT_GOALS,
            workoutRoutines: [],
            workoutHistory: [],
            activeSession: null,
            dailyLogs: {},
        };
        await userDocRef.set(initialData);
        return initialData;
    }
};

/**
 * Updates the user's nutrition and fitness goals.
 * @param userId - The user's unique ID.
 * @param goals - The new goals object.
 */
export const updateGoals = async (userId: string, goals: NutritionGoals): Promise<void> => {
    const userDocRef = getUserDocRef(userId);
    await userDocRef.update({ goals });
};

/**
 * Updates the user's list of workout routines.
 * @param userId - The user's unique ID.
 * @param routines - The new array of workout routines.
 */
export const updateRoutines = async (userId: string, routines: WorkoutRoutine[]): Promise<void> => {
    const userDocRef = getUserDocRef(userId);
    await userDocRef.update({ workoutRoutines: routines });
};

/**
 * Updates the user's currently active workout session.
 * @param userId - The user's unique ID.
 * @param session - The active session object, or null to clear it.
 */
export const updateActiveSession = async (userId: string, session: WorkoutSession | null): Promise<void> => {
    const userDocRef = getUserDocRef(userId);
    await userDocRef.update({ activeSession: session });
};

/**
 * Adds a completed workout session to the user's history and clears the active session.
 * @param userId - The user's unique ID.
 * @param session - The completed workout session.
 */
export const addWorkoutToHistory = async (userId: string, session: WorkoutSession): Promise<void> => {
    const userDocRef = getUserDocRef(userId);
    await userDocRef.update({
        workoutHistory: firebase.firestore.FieldValue.arrayUnion(session),
        activeSession: null // Clear active session upon completion
    });
};

/**
 * Updates the user's daily meal logs.
 * @param userId - The user's unique ID.
 * @param dailyLogs - The complete daily logs object.
 */
export const updateDailyLogs = async (userId: string, dailyLogs: Record<string, DailyLog>): Promise<void> => {
    const userDocRef = getUserDocRef(userId);
    await userDocRef.update({ dailyLogs });
};