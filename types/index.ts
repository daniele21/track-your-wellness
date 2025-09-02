// --- INTERFACCE E TIPI DIETA --- //
export interface FoodItem {
    name: string;
    kcal: number;
    carbs: number;
    protein: number;
    fats: number;
    fiber: number;
}

export interface Goal {
    value: number;
    enabled: boolean;
}

export interface NutritionGoals {
    kcal: Goal;
    carbs: Goal;
    protein: Goal;
    fats: Goal;
    fiber: Goal;
    weeklyWorkouts: Goal;
    workoutGoalDescription?: string; // Obiettivo di allenamento in linguaggio naturale
}

export type MealType = 'Colazione' | 'Spuntino' | 'Pranzo' | 'Cena';

export type DailyLog = {
    [key in MealType]?: FoodItem[];
};

export interface DailyTotals {
    kcal: number;
    carbs: number;
    protein: number;
    fats: number;
    fiber: number;
}

// --- INTERFACCE E TIPI ALLENAMENTO --- //
export interface ExerciseDefinition {
    id: string;
    name: string;
    sets: number;
    reps: string;
    notes: string;
}

export interface WorkoutRoutine {
    id: string;
    name: string;
    description: string;
    exercises: ExerciseDefinition[];
}

export interface LoggedSet {
    weight: number;
    reps: number;
}

export interface LoggedExercise {
    exerciseId: string;
    name:string;
    targetSets: number;
    targetReps: string;
    sets: (LoggedSet | null)[];
    notes: string;
}

export interface WorkoutSession {
    id: string;
    date: string; // YYYY-MM-DD
    routineId: string;
    routineName: string;
    exercises: LoggedExercise[];
    duration: number; // in seconds
}

// --- INTERFACCE E TIPI MISURAZIONI --- //
export interface BodyMeasurement {
    date: string; // YYYY-MM-DD
    weight: number; // kg
    bodyFat?: number; // percentage
    muscleMass?: number; // kg
}

export type View = 'home' | 'pasti' | 'allenamento' | 'misure' | 'analisi' | 'profile';
export type Theme = 'light' | 'dark';


export const MEAL_TYPES: MealType[] = ['Colazione', 'Spuntino', 'Pranzo', 'Cena'];
export const DEFAULT_GOALS: NutritionGoals = {
    kcal: { value: 2000, enabled: true },
    carbs: { value: 250, enabled: true },
    protein: { value: 125, enabled: true },
    fats: { value: 67, enabled: true },
    fiber: { value: 30, enabled: true },
    weeklyWorkouts: { value: 3, enabled: true },
    workoutGoalDescription: '',
};