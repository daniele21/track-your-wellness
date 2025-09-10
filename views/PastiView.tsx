import React, { useState, useMemo } from 'react';
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
    onMoveFoodToMeal?: (fromMeal: MealType, toMeal: MealType, itemIndex: number) => void;
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
    onEditFood,
    onMoveFoodToMeal 
}) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [selectedFood, setSelectedFood] = useState<{ item: any, mealType: MealType } | null>(null);
    const [showMealMoveModal, setShowMealMoveModal] = useState<{ item: any, fromMeal: MealType, itemIndex: number } | null>(null);
    const [activeTab, setActiveTab] = useState<'daily' | 'analytics' | 'trends'>('daily');

    const handleAnalyzeMealPlan = async () => {
        if (Object.keys(dailyLogs).length === 0) {
            alert("Registra alcuni pasti per ottenere una valutazione del tuo piano alimentare.");
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResult('');
        try {
            const analysis = await analyzeMealPlanWithGemini(dailyLogs, workoutSessions, goals, currentDate);
            setAnalysisResult(analysis);
        } catch (error: any) {
            console.error("Failed to analyze meal plan:", error);
            alert(error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Analytics calculations
    const mealAnalytics = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        });

        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        });

        let weekTotals = { kcal: 0, carbs: 0, protein: 0, fats: 0, fiber: 0, days: 0 };
        let monthTotals = { kcal: 0, carbs: 0, protein: 0, fats: 0, fiber: 0, days: 0 };
        let mealTypeStats: { [key in MealType]: { count: number, avgKcal: number, totalKcal: number } } = 
            {} as { [key in MealType]: { count: number, avgKcal: number, totalKcal: number } };
        
        MEAL_TYPES.forEach(meal => {
            mealTypeStats[meal] = { count: 0, avgKcal: 0, totalKcal: 0 };
        });

        // Calculate weekly stats
        last7Days.forEach(date => {
            const dayLog = dailyLogs[date];
            if (dayLog) {
                weekTotals.days++;
                Object.entries(dayLog).forEach(([mealType, items]) => {
                    if (items && items.length > 0) {
                        mealTypeStats[mealType as MealType].count++;
                        items.forEach(item => {
                            weekTotals.kcal += item.kcal;
                            weekTotals.carbs += item.carbs;
                            weekTotals.protein += item.protein;
                            weekTotals.fats += item.fats;
                            weekTotals.fiber += item.fiber;
                            mealTypeStats[mealType as MealType].totalKcal += item.kcal;
                        });
                    }
                });
            }
        });

        // Calculate monthly stats
        last30Days.forEach(date => {
            const dayLog = dailyLogs[date];
            if (dayLog) {
                monthTotals.days++;
                Object.entries(dayLog).forEach(([mealType, items]) => {
                    if (items && items.length > 0) {
                        items.forEach(item => {
                            monthTotals.kcal += item.kcal;
                            monthTotals.carbs += item.carbs;
                            monthTotals.protein += item.protein;
                            monthTotals.fats += item.fats;
                            monthTotals.fiber += item.fiber;
                        });
                    }
                });
            }
        });

        // Calculate averages for meal types
        Object.keys(mealTypeStats).forEach(meal => {
            const stats = mealTypeStats[meal as MealType];
            stats.avgKcal = stats.count > 0 ? stats.totalKcal / stats.count : 0;
        });

        const weeklyAvg = weekTotals.days > 0 ? {
            kcal: weekTotals.kcal / weekTotals.days,
            carbs: weekTotals.carbs / weekTotals.days,
            protein: weekTotals.protein / weekTotals.days,
            fats: weekTotals.fats / weekTotals.days,
            fiber: weekTotals.fiber / weekTotals.days
        } : null;

        const monthlyAvg = monthTotals.days > 0 ? {
            kcal: monthTotals.kcal / monthTotals.days,
            carbs: monthTotals.carbs / monthTotals.days,
            protein: monthTotals.protein / monthTotals.days,
            fats: monthTotals.fats / monthTotals.days,
            fiber: monthTotals.fiber / monthTotals.days
        } : null;

        return {
            weeklyAvg,
            monthlyAvg,
            mealTypeStats,
            weekTotals,
            monthTotals,
            last7Days,
            last30Days
        };
    }, [dailyLogs, currentDate]);

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
            {/* Tab Navigation */}
            <div className="workout-tabs" style={{ marginBottom: '24px' }}>
                <button 
                    className={activeTab === 'daily' ? 'active' : ''}
                    onClick={() => setActiveTab('daily')}
                >
                    <span className="material-symbols-outlined tab-icon">today</span>
                    <span className="tab-text-full">Pasti Giornalieri</span>
                    <span className="tab-text-short">Giornalieri</span>
                </button>
                <button 
                    className={activeTab === 'analytics' ? 'active' : ''}
                    onClick={() => setActiveTab('analytics')}
                >
                    <span className="material-symbols-outlined tab-icon">analytics</span>
                    <span className="tab-text-full">Analisi Nutrizionale</span>
                    <span className="tab-text-short">Analisi</span>
                </button>
                <button 
                    className={activeTab === 'trends' ? 'active' : ''}
                    onClick={() => setActiveTab('trends')}
                >
                    <span className="material-symbols-outlined tab-icon">trending_up</span>
                    <span className="tab-text-full">Tendenze</span>
                    <span className="tab-text-short">Tendenze</span>
                </button>
            </div>

            {activeTab === 'daily' && (
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
                            <div className="food-list">
                                {mealItems.map((item, index) => (
                                    <div key={index} className="food-item-enhanced">
                                        <div className="food-item-main" onClick={() => setSelectedFood({ item, mealType })}>
                                            <div className="food-item-header">
                                                <span className="food-name">{item.name}</span>
                                                <span className="food-calories">{Math.round(item.kcal)} kcal</span>
                                            </div>
                                            <div className="food-item-macros">
                                                <span className="macro carbs">
                                                    <span className="macro-icon">🌾</span>
                                                    {Math.round(item.carbs)}g
                                                </span>
                                                <span className="macro protein">
                                                    <span className="macro-icon">🥩</span>
                                                    {Math.round(item.protein)}g
                                                </span>
                                                <span className="macro fats">
                                                    <span className="macro-icon">🥑</span>
                                                    {Math.round(item.fats)}g
                                                </span>
                                                <span className="macro fiber">
                                                    <span className="macro-icon">🌿</span>
                                                    {Math.round(item.fiber)}g
                                                </span>
                                            </div>
                                        </div>
                                        <div className="food-item-actions">
                                            <button 
                                                onClick={() => setShowMealMoveModal({ item, fromMeal: mealType, itemIndex: index })} 
                                                className="btn-secondary-icon" 
                                                aria-label={`Sposta ${item.name} ad altro pasto`}
                                                title="Sposta ad altro pasto"
                                            >
                                                <span className="material-symbols-outlined">swap_horiz</span>
                                            </button>
                                            <button 
                                                onClick={() => onEditFood(mealType, index)} 
                                                className="btn-secondary-icon" 
                                                aria-label={`Modifica ${item.name}`}
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button 
                                                onClick={() => onDeleteFood(mealType, index)} 
                                                className="btn-danger-icon" 
                                                aria-label={`Rimuovi ${item.name}`}
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                </>
            )}

            {activeTab === 'analytics' && (
                <div>
                    {/* Weekly Bar Charts */}
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--primary-color)' }}>bar_chart</span>
                            Andamento Settimanale
                        </h3>
                        
                        {/* Daily Calories Chart */}
                        <div style={{ marginBottom: '32px' }}>
                            <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>local_fire_department</span>
                                Calorie Giornaliere (Ultimi 7 giorni)
                            </h4>
                            <div className="weekly-chart">
                                {mealAnalytics.last7Days.slice().reverse().map((date, index) => {
                                    const dayLog = dailyLogs[date];
                                    let dayKcal = 0;
                                    if (dayLog) {
                                        Object.values(dayLog).forEach(items => {
                                            items?.forEach(item => {
                                                dayKcal += item.kcal;
                                            });
                                        });
                                    }
                                    const dayName = new Date(date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' });
                                    const maxKcal = Math.max(...mealAnalytics.last7Days.map(d => {
                                        const log = dailyLogs[d];
                                        let kcal = 0;
                                        if (log) {
                                            Object.values(log).forEach(items => {
                                                items?.forEach(item => kcal += item.kcal);
                                            });
                                        }
                                        return kcal;
                                    }), goals.kcal.value);
                                    
                                    return (
                                        <div key={date} className="chart-bar-container">
                                            <div className="chart-bar">
                                                <div 
                                                    className="bar-fill calories-bar"
                                                    style={{ 
                                                        height: `${(dayKcal / maxKcal) * 100}%`,
                                                        background: dayKcal > goals.kcal.value ? 'var(--danger-color)' : 'var(--primary-color)'
                                                    }}
                                                ></div>
                                                <div className="goal-line" style={{ bottom: `${(goals.kcal.value / maxKcal) * 100}%` }}></div>
                                            </div>
                                            <div className="chart-label">
                                                <div className="day-name">{dayName}</div>
                                                <div className="day-value">{Math.round(dayKcal)} kcal</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Daily Macros Stacked Chart */}
                        <div>
                            <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>pie_chart</span>
                                Macronutrienti Giornalieri (Ultimi 7 giorni)
                            </h4>
                            <div className="weekly-chart">
                                {mealAnalytics.last7Days.slice().reverse().map((date, index) => {
                                    const dayLog = dailyLogs[date];
                                    let dayMacros = { carbs: 0, protein: 0, fats: 0 };
                                    if (dayLog) {
                                        Object.values(dayLog).forEach(items => {
                                            items?.forEach(item => {
                                                dayMacros.carbs += item.carbs;
                                                dayMacros.protein += item.protein;
                                                dayMacros.fats += item.fats;
                                            });
                                        });
                                    }
                                    const dayName = new Date(date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' });
                                    const totalMacros = dayMacros.carbs + dayMacros.protein + dayMacros.fats;
                                    const maxMacros = Math.max(...mealAnalytics.last7Days.map(d => {
                                        const log = dailyLogs[d];
                                        let macros = { carbs: 0, protein: 0, fats: 0 };
                                        if (log) {
                                            Object.values(log).forEach(items => {
                                                items?.forEach(item => {
                                                    macros.carbs += item.carbs;
                                                    macros.protein += item.protein;
                                                    macros.fats += item.fats;
                                                });
                                            });
                                        }
                                        return macros.carbs + macros.protein + macros.fats;
                                    }), goals.carbs.value + goals.protein.value + goals.fats.value);
                                    
                                    const carbsHeight = totalMacros > 0 ? (dayMacros.carbs / maxMacros) * 100 : 0;
                                    const proteinHeight = totalMacros > 0 ? (dayMacros.protein / maxMacros) * 100 : 0;
                                    const fatsHeight = totalMacros > 0 ? (dayMacros.fats / maxMacros) * 100 : 0;
                                    
                                    return (
                                        <div key={date} className="chart-bar-container">
                                            <div className="chart-bar stacked-bar">
                                                <div 
                                                    className="bar-segment carbs-segment"
                                                    style={{ 
                                                        height: `${carbsHeight}%`,
                                                        background: 'var(--carbs-color)'
                                                    }}
                                                ></div>
                                                <div 
                                                    className="bar-segment protein-segment"
                                                    style={{ 
                                                        height: `${proteinHeight}%`,
                                                        background: 'var(--protein-color)'
                                                    }}
                                                ></div>
                                                <div 
                                                    className="bar-segment fats-segment"
                                                    style={{ 
                                                        height: `${fatsHeight}%`,
                                                        background: 'var(--fats-color)'
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="chart-label">
                                                <div className="day-name">{dayName}</div>
                                                <div className="macro-values">
                                                    <div style={{ color: 'var(--carbs-color)', fontSize: '0.8rem' }}>{Math.round(dayMacros.carbs)}g</div>
                                                    <div style={{ color: 'var(--protein-color)', fontSize: '0.8rem' }}>{Math.round(dayMacros.protein)}g</div>
                                                    <div style={{ color: 'var(--fats-color)', fontSize: '0.8rem' }}>{Math.round(dayMacros.fats)}g</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Legend */}
                            <div className="chart-legend">
                                <div className="legend-item">
                                    <div className="legend-color" style={{ background: 'var(--carbs-color)' }}></div>
                                    <span>Carboidrati</span>
                                </div>
                                <div className="legend-item">
                                    <div className="legend-color" style={{ background: 'var(--protein-color)' }}></div>
                                    <span>Proteine</span>
                                </div>
                                <div className="legend-item">
                                    <div className="legend-color" style={{ background: 'var(--fats-color)' }}></div>
                                    <span>Grassi</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weekly vs Monthly Comparison */}
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--primary-color)' }}>analytics</span>
                            Medie Nutrizionali
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            {mealAnalytics.weeklyAvg && (
                                <div className="nutrition-comparison-card">
                                    <h4 style={{ marginBottom: '16px', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span className="material-symbols-outlined">date_range</span>
                                        Ultima Settimana
                                    </h4>
                                    <div className="nutrition-stats">
                                        <div className="stat-item">
                                            <span className="material-symbols-outlined">local_fire_department</span>
                                            <span className="stat-value">{Math.round(mealAnalytics.weeklyAvg.kcal)} kcal/giorno</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="material-symbols-outlined" style={{ color: 'var(--carbs-color)' }}>grain</span>
                                            <span className="stat-value">{Math.round(mealAnalytics.weeklyAvg.carbs)}g Carb</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="material-symbols-outlined" style={{ color: 'var(--protein-color)' }}>egg</span>
                                            <span className="stat-value">{Math.round(mealAnalytics.weeklyAvg.protein)}g Prot</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="material-symbols-outlined" style={{ color: 'var(--fats-color)' }}>restaurant</span>
                                            <span className="stat-value">{Math.round(mealAnalytics.weeklyAvg.fats)}g Grassi</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {mealAnalytics.monthlyAvg && (
                                <div className="nutrition-comparison-card">
                                    <h4 style={{ marginBottom: '16px', color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span className="material-symbols-outlined">calendar_month</span>
                                        Ultimo Mese
                                    </h4>
                                    <div className="nutrition-stats">
                                        <div className="stat-item">
                                            <span className="material-symbols-outlined">local_fire_department</span>
                                            <span className="stat-value">{Math.round(mealAnalytics.monthlyAvg.kcal)} kcal/giorno</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="material-symbols-outlined" style={{ color: 'var(--carbs-color)' }}>grain</span>
                                            <span className="stat-value">{Math.round(mealAnalytics.monthlyAvg.carbs)}g Carb</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="material-symbols-outlined" style={{ color: 'var(--protein-color)' }}>egg</span>
                                            <span className="stat-value">{Math.round(mealAnalytics.monthlyAvg.protein)}g Prot</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="material-symbols-outlined" style={{ color: 'var(--fats-color)' }}>restaurant</span>
                                            <span className="stat-value">{Math.round(mealAnalytics.monthlyAvg.fats)}g Grassi</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Meal Type Analysis */}
                    <div className="card" style={{ marginBottom: '80px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--primary-color)' }}>restaurant_menu</span>
                            Analisi per Tipo di Pasto
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            {MEAL_TYPES.map(mealType => {
                                const stats = mealAnalytics.mealTypeStats[mealType];
                                const icon = mealType === 'Colazione' ? 'coffee' : 
                                           mealType === 'Pranzo' ? 'lunch_dining' : 
                                           mealType === 'Cena' ? 'dinner_dining' : 'cookie';
                                           
                                return (
                                    <div key={mealType} className="meal-type-analysis-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                            <span className="material-symbols-outlined" style={{ color: 'var(--primary-color)' }}>{icon}</span>
                                            <h4 style={{ margin: 0 }}>{mealType}</h4>
                                        </div>
                                        <div className="meal-stats">
                                            <div className="meal-stat-item">
                                                <span className="label">Frequenza (7gg)</span>
                                                <span className="value">{stats.count} volte</span>
                                            </div>
                                            <div className="meal-stat-item">
                                                <span className="label">Media kcal</span>
                                                <span className="value">{Math.round(stats.avgKcal)} kcal</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'trends' && (
                <div>
                    {/* Goals Comparison */}
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--primary-color)' }}>track_changes</span>
                            Obiettivi vs Realtà
                        </h3>
                        
                        {mealAnalytics.weeklyAvg && (
                            <div className="goals-comparison">
                                <div className="goal-item">
                                    <div className="goal-header">
                                        <span className="material-symbols-outlined">local_fire_department</span>
                                        <span>Calorie</span>
                                    </div>
                                    <div className="goal-bars">
                                        <div className="goal-bar">
                                            <div className="bar-label">Obiettivo: {goals.kcal.value} kcal</div>
                                            <div className="progress-bar">
                                                <div className="progress" style={{ width: '100%', background: 'var(--secondary-color)' }}></div>
                                            </div>
                                        </div>
                                        <div className="goal-bar">
                                            <div className="bar-label">Media: {Math.round(mealAnalytics.weeklyAvg.kcal)} kcal</div>
                                            <div className="progress-bar">
                                                <div className="progress" style={{ 
                                                    width: `${Math.min(100, (mealAnalytics.weeklyAvg.kcal / goals.kcal.value) * 100)}%`,
                                                    background: mealAnalytics.weeklyAvg.kcal > goals.kcal.value ? 'var(--danger-color)' : 'var(--primary-color)'
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="goal-item">
                                    <div className="goal-header">
                                        <span className="material-symbols-outlined" style={{ color: 'var(--protein-color)' }}>egg</span>
                                        <span>Proteine</span>
                                    </div>
                                    <div className="goal-bars">
                                        <div className="goal-bar">
                                            <div className="bar-label">Obiettivo: {goals.protein.value}g</div>
                                            <div className="progress-bar">
                                                <div className="progress" style={{ width: '100%', background: 'var(--secondary-color)' }}></div>
                                            </div>
                                        </div>
                                        <div className="goal-bar">
                                            <div className="bar-label">Media: {Math.round(mealAnalytics.weeklyAvg.protein)}g</div>
                                            <div className="progress-bar">
                                                <div className="progress" style={{ 
                                                    width: `${Math.min(100, (mealAnalytics.weeklyAvg.protein / goals.protein.value) * 100)}%`,
                                                    background: 'var(--protein-color)'
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="goal-item">
                                    <div className="goal-header">
                                        <span className="material-symbols-outlined" style={{ color: 'var(--carbs-color)' }}>grain</span>
                                        <span>Carboidrati</span>
                                    </div>
                                    <div className="goal-bars">
                                        <div className="goal-bar">
                                            <div className="bar-label">Obiettivo: {goals.carbs.value}g</div>
                                            <div className="progress-bar">
                                                <div className="progress" style={{ width: '100%', background: 'var(--secondary-color)' }}></div>
                                            </div>
                                        </div>
                                        <div className="goal-bar">
                                            <div className="bar-label">Media: {Math.round(mealAnalytics.weeklyAvg.carbs)}g</div>
                                            <div className="progress-bar">
                                                <div className="progress" style={{ 
                                                    width: `${Math.min(100, (mealAnalytics.weeklyAvg.carbs / goals.carbs.value) * 100)}%`,
                                                    background: 'var(--carbs-color)'
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="goal-item">
                                    <div className="goal-header">
                                        <span className="material-symbols-outlined" style={{ color: 'var(--fats-color)' }}>restaurant</span>
                                        <span>Grassi</span>
                                    </div>
                                    <div className="goal-bars">
                                        <div className="goal-bar">
                                            <div className="bar-label">Obiettivo: {goals.fats.value}g</div>
                                            <div className="progress-bar">
                                                <div className="progress" style={{ width: '100%', background: 'var(--secondary-color)' }}></div>
                                            </div>
                                        </div>
                                        <div className="goal-bar">
                                            <div className="bar-label">Media: {Math.round(mealAnalytics.weeklyAvg.fats)}g</div>
                                            <div className="progress-bar">
                                                <div className="progress" style={{ 
                                                    width: `${Math.min(100, (mealAnalytics.weeklyAvg.fats / goals.fats.value) * 100)}%`,
                                                    background: 'var(--fats-color)'
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI Analysis */}
                    <div className="card" style={{ marginBottom: '80px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--primary-color)' }}>psychology</span>
                            Analisi IA
                        </h3>
                        
                        <button 
                            className="btn-secondary" 
                            onClick={handleAnalyzeMealPlan} 
                            disabled={isAnalyzing}
                            style={{marginBottom: '16px'}}
                        >
                            <span className="material-symbols-outlined">psychology</span>
                            {isAnalyzing ? "Analizzando..." : "Valuta Piano Alimentare"}
                        </button>

                        {analysisResult && (
                            <div style={{whiteSpace: 'pre-wrap', lineHeight: '1.6', background: 'var(--card-background)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
                                {analysisResult}
                            </div>
                        )}
                    </div>
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

            {/* Move Food Modal */}
            {showMealMoveModal && onMoveFoodToMeal && (
                <div className="modal-overlay" style={{ position: 'fixed', zIndex: 9999, top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ minWidth: '320px', maxWidth: '90vw', padding: '24px', borderRadius: '18px', boxShadow: '0 4px 24px rgba(59,130,246,0.12)', position: 'relative' }}>
                        <button className="btn-secondary" style={{ position: 'absolute', top: 18, right: 18 }} onClick={() => setShowMealMoveModal(null)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h3 style={{ marginBottom: '18px', fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary-color)' }}>
                            Sposta "{showMealMoveModal.item.name}"
                        </h3>
                        <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                            Seleziona il pasto di destinazione:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {MEAL_TYPES.filter(meal => meal !== showMealMoveModal.fromMeal).map(mealType => (
                                <button
                                    key={mealType}
                                    className="btn-secondary"
                                    style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                                    onClick={() => {
                                        onMoveFoodToMeal(showMealMoveModal.fromMeal, mealType, showMealMoveModal.itemIndex);
                                        setShowMealMoveModal(null);
                                    }}
                                >
                                    <span className="material-symbols-outlined">
                                        {mealType === 'Colazione' ? 'coffee' : 
                                         mealType === 'Pranzo' ? 'lunch_dining' : 
                                         mealType === 'Cena' ? 'dinner_dining' : 'cookie'}
                                    </span>
                                    {mealType}
                                </button>
                            ))}
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
