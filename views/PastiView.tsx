import React, { useState } from 'react';
import { DailyLog, MealType, MEAL_TYPES, NutritionGoals, WorkoutSession } from '../types/index';
import { analyzeMealPlanWithGemini } from '../services/geminiService';

interface PastiViewProps {
    dailyLog: DailyLog | null;
    dailyLogs: { [date: string]: DailyLog };
    workoutSessions: WorkoutSession[];
    goals: NutritionGoals;
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    onAddMealClick: () => void;
    onDeleteFood: (mealType: MealType, itemIndex: number) => void;
    onEditFood: (mealType: MealType, itemIndex: number) => void;
}

export const PastiView: React.FC<PastiViewProps> = ({ 
    dailyLog, 
    dailyLogs, 
    workoutSessions, 
    goals, 
    currentDate, 
    setCurrentDate, 
    onAddMealClick, 
    onDeleteFood, 
    onEditFood 
}) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');

    const handleAnalyzeMealPlan = async () => {
        if (Object.keys(dailyLogs).length === 0) {
            alert("Registra alcuni pasti per ottenere una valutazione del tuo piano alimentare.");
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResult('');
        try {
            const analysis = await analyzeMealPlanWithGemini(dailyLogs, workoutSessions, goals);
            setAnalysisResult(analysis);
        } catch (error: any) {
            console.error("Failed to analyze meal plan:", error);
            alert(error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <>
            {MEAL_TYPES.map(mealType => {
                const mealItems = dailyLog?.[mealType] ?? [];
                const mealKcal = mealItems.reduce((sum, item) => sum + item.kcal, 0);

                return (
                    <div className="card" key={mealType}>
                        <div className="meal-header">
                            <h3>{mealType}</h3>
                            <span className="calories">{Math.round(mealKcal)} kcal</span>
                        </div>
                        {mealItems.length > 0 ? (
                            <ul className="food-list">
                                {mealItems.map((item, index) => (
                                    <li key={index} className="food-item">
                                        <span className="name">{item.name}</span>
                                        <div className="food-item-actions">
                                            <span className="kcal">{Math.round(item.kcal)} kcal</span>
                                             <button onClick={() => onEditFood(mealType, index)} className="btn-secondary-icon" aria-label={`Modifica ${item.name}`}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                            </button>
                                             <button onClick={() => onDeleteFood(mealType, index)} className="btn-danger-icon" aria-label={`Rimuovi ${item.name}`}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-meal">Nessun alimento aggiunto.</p>
                        )}
                    </div>
                );
            })}
            
            <div className="page-actions-container" style={{marginBottom: '80px'}}>
                <button 
                    className="btn-secondary" 
                    onClick={handleAnalyzeMealPlan} 
                    disabled={isAnalyzing}
                    style={{marginBottom: '16px'}}
                >
                    <span className="material-symbols-outlined">psychology</span>
                    {isAnalyzing ? "Analizzando..." : "Valuta Piano Alimentare"}
                </button>
            </div>

            {analysisResult && (
                <div className="card" style={{marginBottom: '80px'}}>
                    <h4>Valutazione del Piano Alimentare</h4>
                    <div style={{whiteSpace: 'pre-wrap', lineHeight: '1.6'}}>{analysisResult}</div>
                </div>
            )}

            <button className="fab" onClick={onAddMealClick} aria-label="Aggiungi pasto">
                <span className="material-symbols-outlined">add</span>
            </button>
        </>
    );
};