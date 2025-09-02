import React, { useState, useEffect, useMemo } from 'react';
import { DateNavigator } from '../components/DateNavigator';
import { CalorieRing } from '../components/CalorieRing';
import { MacroBar } from '../components/MacroBar';
// Import MEAL_TYPES to iterate over known meal keys safely.
import { DailyLog, DailyTotals, NutritionGoals, View, WorkoutSession, MEAL_TYPES, BodyMeasurement } from '../types/index';
import { getDailyTipWithGemini } from '../services/geminiService';
import { formatDate } from '../types/utils/helpers';

interface HomeViewProps {
    dailyLog: DailyLog | null;
    goals: NutritionGoals;
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    setView: (view: View) => void;
    onAddMeal: () => void;
    workoutHistory: WorkoutSession[];
    bodyMeasurements: BodyMeasurement[];
    onOpenMeasurementModal: (date?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ dailyLog, goals, currentDate, setCurrentDate, setView, onAddMeal, workoutHistory, bodyMeasurements, onOpenMeasurementModal }) => {
    const [dailyTip, setDailyTip] = useState<string | null>(null);

    const totals = useMemo<DailyTotals>(() => {
        const t: DailyTotals = { kcal: 0, carbs: 0, protein: 0, fats: 0, fiber: 0 };
        if (!dailyLog) return t;
        // Replaced `for (const meal of Object.values(dailyLog))` with an iteration over `MEAL_TYPES`
        // to avoid potential issues with Object.values support in the TS/JS environment.
        for (const mealType of MEAL_TYPES) {
            const meal = dailyLog[mealType];
            if (meal) {
                for (const item of meal) {
                    t.kcal += item.kcal;
                    t.carbs += item.carbs;
                    t.protein += item.protein;
                    t.fats += item.fats;
                    t.fiber += item.fiber;
                }
            }
        }
        return t;
    }, [dailyLog]);
    
    const weeklyWorkoutStats = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ...
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is sunday
        const firstDayOfWeek = new Date(today.setDate(diff));
        firstDayOfWeek.setHours(0, 0, 0, 0);

        const completed = workoutHistory.filter(session => new Date(session.date) >= firstDayOfWeek).length;
        const goal = goals.weeklyWorkouts?.value ?? 3;
        
        return { completed, goal };
    }, [workoutHistory, goals.weeklyWorkouts]);
    
    const latestMeasurement = useMemo(() => {
        if (!bodyMeasurements || bodyMeasurements.length === 0) return null;
        return bodyMeasurements[bodyMeasurements.length - 1];
    }, [bodyMeasurements]);

    const hasTodaysMeasurement = useMemo(() => {
        const todayKey = formatDate(new Date());
        return bodyMeasurements.some(m => m.date === todayKey);
    }, [bodyMeasurements]);

    useEffect(() => {
        if (formatDate(currentDate) === formatDate(new Date())) {
            getDailyTipWithGemini(goals).then(setDailyTip);
        } else {
            setDailyTip(null);
        }
    }, [currentDate, goals]);

    const enabledMacros = (Object.keys(goals) as Array<keyof NutritionGoals>).filter(key => key !== 'kcal' && key !== 'weeklyWorkouts' && goals[key].enabled);
    const macroGridClass = `macros macros-grid-${enabledMacros.length > 2 ? Math.ceil(enabledMacros.length / 2) * 2 : enabledMacros.length}`;


    return (
        <>
            <div className="card">
                <h2>Riepilogo Giornaliero</h2>
                <div className="calories-summary">
                    <CalorieRing current={totals.kcal} goal={goals.kcal.enabled ? goals.kcal.value : undefined} />
                </div>
            </div>
            
             <div className="card">
                <h3>Azioni Rapide</h3>
                <div className="quick-actions-container">
                    <button className="btn-secondary" onClick={onAddMeal}>
                        <span className="material-symbols-outlined">restaurant_menu</span>
                        Aggiungi Pasto
                    </button>
                    <button className="btn-secondary" onClick={() => setView('allenamento')}>
                        <span className="material-symbols-outlined">fitness_center</span>
                        Inizia Workout
                    </button>
                </div>
            </div>

             <div className="card">
                <h3>Le Mie Misure</h3>
                {latestMeasurement ? (
                    <>
                        <div className="latest-measurement-display">
                             <div className="measurement-item">
                                 <span className="measurement-value">{latestMeasurement.weight.toFixed(1)}</span>
                                 <span className="measurement-label">kg</span>
                                 <span className="measurement-name">Peso</span>
                             </div>
                             {latestMeasurement.muscleMass != null && (
                                <div className="measurement-item">
                                    <span className="measurement-value">{latestMeasurement.muscleMass.toFixed(1)}</span>
                                    <span className="measurement-label">kg</span>
                                    <span className="measurement-name">Muscoli</span>
                                </div>
                             )}
                              {latestMeasurement.bodyFat != null && (
                                <div className="measurement-item">
                                    <span className="measurement-value">{latestMeasurement.bodyFat.toFixed(1)}</span>
                                    <span className="measurement-label">%</span>
                                    <span className="measurement-name">Grasso</span>
                                </div>
                             )}
                        </div>
                        <p className="measurement-date">
                            Ultima registrazione: {new Date(latestMeasurement.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
                        </p>
                    </>
                ) : (
                    <p className="empty-state" style={{padding: '0 0 16px 0'}}>Nessuna misurazione registrata.</p>
                )}
                <button className="btn-secondary" style={{width: '100%'}} onClick={() => onOpenMeasurementModal()}>
                    <span className="material-symbols-outlined">monitor_weight</span>
                    {hasTodaysMeasurement ? 'Aggiorna Misurazione' : 'Registra Misurazione'}
                </button>
            </div>
            
            {goals.weeklyWorkouts?.enabled && (
                 <div className="card">
                    <h3>Allenamento Settimanale</h3>
                    <div className="weekly-workout-tracker">
                        {[...Array(weeklyWorkoutStats.goal)].map((_, index) => (
                            <div key={index} className={`workout-dot ${index < weeklyWorkoutStats.completed ? 'completed' : ''}`}></div>
                        ))}
                    </div>
                    <p className="weekly-workout-summary-text">
                        {weeklyWorkoutStats.completed} su {weeklyWorkoutStats.goal} allenamenti completati questa settimana.
                    </p>
                </div>
            )}
            
            <div className="card">
                <h3>Macronutrienti</h3>
                <div className={macroGridClass}>
                    {goals.carbs.enabled && <MacroBar name="Carboidrati" current={totals.carbs} goal={goals.carbs.value} colorClass="carbs" />}
                    {goals.protein.enabled && <MacroBar name="Proteine" current={totals.protein} goal={goals.protein.value} colorClass="protein" />}
                    {goals.fats.enabled && <MacroBar name="Grassi" current={totals.fats} goal={goals.fats.value} colorClass="fats" />}
                    {goals.fiber.enabled && <MacroBar name="Fibre" current={totals.fiber} goal={goals.fiber.value} colorClass="fiber" />}
                </div>
            </div>
            
            {dailyTip && (
                <div className="card">
                    <h3>Consiglio del Giorno</h3>
                    <p>{dailyTip}</p>
                </div>
            )}
        </>
    );
};