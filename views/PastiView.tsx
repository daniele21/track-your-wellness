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
    const [selectedFood, setSelectedFood] = useState<{ item: any, mealType: MealType } | null>(null);

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

    // Calculate daily totals
    const totals = { kcal: 0, carbs: 0, protein: 0, fats: 0, fiber: 0 };
    if (dailyLog) {
        Object.values(dailyLog).forEach(items => {
            items?.forEach(item => {
                totals.kcal += item.kcal;
                totals.carbs += item.carbs;
                totals.protein += item.protein;
                totals.fats += item.fats;
                totals.fiber += item.fiber;
            });
        });
    }

    return (
        <>
            {/* Daily Recap Section */}
            <div className="card daily-recap" style={{ marginBottom: '24px', padding: '24px', borderRadius: '18px', background: 'var(--surface-color)', boxShadow: '0 4px 16px rgba(59,130,246,0.08)', border: '2px solid var(--primary-gradient-start)' }}>
                <h3 style={{ margin: '0 0 12px 0', fontWeight: 700, fontSize: '1.3rem', color: 'var(--primary-color)', letterSpacing: '0.5px' }}>
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--primary-color)', fontSize: '28px' }}>local_fire_department</span>
                    Riepilogo Giornaliero
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{ color: 'var(--primary-color)', fontSize: '22px' }}>local_fire_department</span>
                        {Math.round(totals.kcal)} kcal
                    </div>
                    <div style={{ display: 'flex', gap: '18px', alignItems: 'center', fontSize: '1.05rem', fontWeight: 600 }}>
                        <span style={{ color: 'var(--carbs-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--carbs-color)' }}>grain</span>
                            {Math.round(totals.carbs)}g Carb
                        </span>
                        <span style={{ color: 'var(--protein-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--protein-color)' }}>egg</span>
                            {Math.round(totals.protein)}g Prot
                        </span>
                        <span style={{ color: 'var(--fats-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--fats-color)' }}>restaurant</span>
                            {Math.round(totals.fats)}g Grassi
                        </span>
                        <span style={{ color: 'var(--fiber-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--fiber-color)' }}>eco</span>
                            {Math.round(totals.fiber)}g Fibra
                        </span>
                    </div>
                </div>
            </div>

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
                                        <span className="name" style={{ cursor: 'pointer' }} onClick={() => setSelectedFood({ item, mealType })}>{item.name}</span>
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
            {/* Dialog nutrizionale cibo */}
            {selectedFood && (
                <div className="modal-overlay" style={{ position: 'fixed', zIndex: 9999, top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ minWidth: '320px', maxWidth: '90vw', padding: '32px', borderRadius: '18px', boxShadow: '0 4px 24px rgba(59,130,246,0.12)', position: 'relative' }}>
                        <button className="btn-secondary" style={{ position: 'absolute', top: 18, right: 18 }} onClick={() => setSelectedFood(null)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h3 style={{ marginBottom: '18px', fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary-color)' }}>{selectedFood.item.name}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '1.08rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="material-symbols-outlined" style={{ color: 'var(--primary-color)', fontSize: '22px' }}>local_fire_department</span>
                                <span style={{ fontWeight: 600 }}>{Math.round(selectedFood.item.kcal)} kcal</span>
                            </div>
                            <div style={{ display: 'flex', gap: '18px', alignItems: 'center', fontWeight: 500 }}>
                                <span style={{ color: 'var(--carbs-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--carbs-color)' }}>grain</span>
                                    {Math.round(selectedFood.item.carbs)}g Carb
                                </span>
                                <span style={{ color: 'var(--protein-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--protein-color)' }}>egg</span>
                                    {Math.round(selectedFood.item.protein)}g Prot
                                </span>
                                <span style={{ color: 'var(--fats-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--fats-color)' }}>restaurant</span>
                                    {Math.round(selectedFood.item.fats)}g Grassi
                                </span>
                                <span style={{ color: 'var(--fiber-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--fiber-color)' }}>eco</span>
                                    {Math.round(selectedFood.item.fiber)}g Fibra
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <button className="fab" onClick={onAddMealClick} aria-label="Aggiungi pasto">
                <span className="material-symbols-outlined">add</span>
            </button>
        </>
    );
};
