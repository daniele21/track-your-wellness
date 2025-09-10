import React, { useState, useMemo } from 'react';
import { WorkoutSession, BodyMeasurement, DailyLog, MealType } from '../types/index';
import { formatDuration } from '../types/utils/helpers';

interface ReportsViewProps {
    workoutSessions: WorkoutSession[];
    measurements: BodyMeasurement[];
    nutritionData: { [date: string]: DailyLog };
}

interface DayReport {
    date: string;
    workouts: WorkoutSession[];
    measurement?: BodyMeasurement;
    nutrition?: {
        totalKcal: number;
        totalCarbs: number;
        totalProtein: number;
        totalFats: number;
        totalFiber: number;
        mealsCount: number;
    };
}

interface WeekReport {
    weekStart: string;
    weekEnd: string;
    totalWorkouts: number;
    totalDuration: number;
    avgWorkoutDuration: number;
    uniqueExercises: Set<string>;
    weightChange?: number;
    avgDailyKcal: number;
    workoutDays: string[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
    workoutSessions,
    measurements,
    nutritionData
}) => {
    const [reportType, setReportType] = useState<'daily' | 'weekly'>('weekly');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('');

    // Calculate daily reports
    const dailyReports = useMemo(() => {
        const reports: DayReport[] = [];
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        });

        last30Days.forEach(date => {
            const workouts = workoutSessions.filter(session => session.date === date);
            const measurement = measurements.find(m => m.date === date);
            
            let nutrition = undefined;
            if (nutritionData[date]) {
                const dayLog = nutritionData[date];
                let totalKcal = 0, totalCarbs = 0, totalProtein = 0, totalFats = 0, totalFiber = 0;
                let mealsCount = 0;

                Object.values(dayLog).forEach(mealItems => {
                    if (mealItems && mealItems.length > 0) {
                        mealsCount++;
                        mealItems.forEach(item => {
                            totalKcal += item.kcal;
                            totalCarbs += item.carbs;
                            totalProtein += item.protein;
                            totalFats += item.fats;
                            totalFiber += item.fiber;
                        });
                    }
                });

                nutrition = {
                    totalKcal,
                    totalCarbs,
                    totalProtein,
                    totalFats,
                    totalFiber,
                    mealsCount
                };
            }

            reports.push({
                date,
                workouts,
                measurement,
                nutrition
            });
        });

        return reports.reverse(); // Most recent first
    }, [workoutSessions, measurements, nutritionData]);

    // Calculate weekly reports
    const weeklyReports = useMemo(() => {
        const reports: WeekReport[] = [];
        const weeks = 12; // Last 12 weeks

        for (let w = 0; w < weeks; w++) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (w * 7) - weekStart.getDay());
            weekStart.setHours(0, 0, 0, 0);
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            const weekStartStr = weekStart.toISOString().split('T')[0];
            const weekEndStr = weekEnd.toISOString().split('T')[0];

            // Get workouts for this week
            const weekWorkouts = workoutSessions.filter(session => {
                const sessionDate = new Date(session.date);
                return sessionDate >= weekStart && sessionDate <= weekEnd;
            });

            const totalDuration = weekWorkouts.reduce((sum, session) => sum + session.duration, 0);
            const uniqueExercises = new Set<string>();
            const workoutDays = new Set<string>();

            weekWorkouts.forEach(session => {
                workoutDays.add(session.date);
                session.exercises.forEach(exercise => {
                    uniqueExercises.add(exercise.name);
                });
            });

            // Calculate weight change
            const weekStartMeasurement = measurements
                .filter(m => m.date >= weekStartStr && m.date <= weekEndStr)
                .sort((a, b) => a.date.localeCompare(b.date))[0];
            
            const weekEndMeasurement = measurements
                .filter(m => m.date >= weekStartStr && m.date <= weekEndStr)
                .sort((a, b) => b.date.localeCompare(a.date))[0];

            let weightChange = undefined;
            if (weekStartMeasurement && weekEndMeasurement && weekStartMeasurement.date !== weekEndMeasurement.date) {
                weightChange = weekEndMeasurement.weight - weekStartMeasurement.weight;
            }

            // Calculate average daily calories
            let totalKcal = 0;
            let daysWithNutrition = 0;
            
            for (let d = 0; d < 7; d++) {
                const day = new Date(weekStart);
                day.setDate(day.getDate() + d);
                const dayStr = day.toISOString().split('T')[0];
                
                if (nutritionData[dayStr]) {
                    const dayLog = nutritionData[dayStr];
                    let dayKcal = 0;
                    Object.values(dayLog).forEach(mealItems => {
                        if (mealItems) {
                            mealItems.forEach(item => dayKcal += item.kcal);
                        }
                    });
                    if (dayKcal > 0) {
                        totalKcal += dayKcal;
                        daysWithNutrition++;
                    }
                }
            }

            reports.push({
                weekStart: weekStartStr,
                weekEnd: weekEndStr,
                totalWorkouts: weekWorkouts.length,
                totalDuration,
                avgWorkoutDuration: weekWorkouts.length > 0 ? totalDuration / weekWorkouts.length : 0,
                uniqueExercises,
                weightChange,
                avgDailyKcal: daysWithNutrition > 0 ? totalKcal / daysWithNutrition : 0,
                workoutDays: Array.from(workoutDays)
            });
        }

        return reports;
    }, [workoutSessions, measurements, nutritionData]);

    const getWeeklyTrend = (reports: WeekReport[], metric: 'workouts' | 'duration' | 'weight') => {
        if (reports.length < 2) return 'stable';
        
        const current = reports[0];
        const previous = reports[1];
        
        let currentValue, previousValue;
        
        switch (metric) {
            case 'workouts':
                currentValue = current.totalWorkouts;
                previousValue = previous.totalWorkouts;
                break;
            case 'duration':
                currentValue = current.totalDuration;
                previousValue = previous.totalDuration;
                break;
            case 'weight':
                currentValue = current.weightChange || 0;
                previousValue = previous.weightChange || 0;
                break;
        }
        
        if (currentValue > previousValue) return 'increasing';
        if (currentValue < previousValue) return 'decreasing';
        return 'stable';
    };

    return (
        <div className="reports-view">
            <div className="reports-header">
                <h3>Report e Analisi</h3>
                <div className="report-controls">
                    <div className="report-type-toggle">
                        <button 
                            className={reportType === 'weekly' ? 'active' : ''}
                            onClick={() => setReportType('weekly')}
                        >
                            <span className="material-symbols-outlined">date_range</span>
                            Settimanale
                        </button>
                        <button 
                            className={reportType === 'daily' ? 'active' : ''}
                            onClick={() => setReportType('daily')}
                        >
                            <span className="material-symbols-outlined">today</span>
                            Giornaliero
                        </button>
                    </div>
                </div>
            </div>

            {reportType === 'weekly' && (
                <div className="weekly-reports">
                    <div className="reports-grid">
                        {weeklyReports.slice(0, 8).map((report, index) => {
                            const isCurrentWeek = index === 0;
                            const workoutTrend = getWeeklyTrend(weeklyReports.slice(index), 'workouts');
                            const durationTrend = getWeeklyTrend(weeklyReports.slice(index), 'duration');
                            
                            return (
                                <div key={`${report.weekStart}-${report.weekEnd}`} className={`report-card ${isCurrentWeek ? 'current-week' : ''}`}>
                                    <div className="report-card-header">
                                        <h4>
                                            {new Date(report.weekStart).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} - {' '}
                                            {new Date(report.weekEnd).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                                        </h4>
                                        {isCurrentWeek && <span className="current-badge">Settimana Corrente</span>}
                                    </div>

                                    <div className="report-metrics">
                                        <div className="metric">
                                            <div className="metric-header">
                                                <span className="metric-label">Allenamenti</span>
                                                <span className={`trend-icon ${workoutTrend}`}>
                                                    <span className="material-symbols-outlined">
                                                        {workoutTrend === 'increasing' ? 'trending_up' : 
                                                         workoutTrend === 'decreasing' ? 'trending_down' : 'trending_flat'}
                                                    </span>
                                                </span>
                                            </div>
                                            <span className="metric-value">{report.totalWorkouts}</span>
                                        </div>

                                        <div className="metric">
                                            <div className="metric-header">
                                                <span className="metric-label">Durata Totale</span>
                                                <span className={`trend-icon ${durationTrend}`}>
                                                    <span className="material-symbols-outlined">
                                                        {durationTrend === 'increasing' ? 'trending_up' : 
                                                         durationTrend === 'decreasing' ? 'trending_down' : 'trending_flat'}
                                                    </span>
                                                </span>
                                            </div>
                                            <span className="metric-value">{formatDuration(report.totalDuration)}</span>
                                        </div>

                                        <div className="metric">
                                            <span className="metric-label">Media Sessione</span>
                                            <span className="metric-value">
                                                {report.avgWorkoutDuration > 0 ? formatDuration(report.avgWorkoutDuration) : '-'}
                                            </span>
                                        </div>

                                        <div className="metric">
                                            <span className="metric-label">Esercizi Unici</span>
                                            <span className="metric-value">{report.uniqueExercises.size}</span>
                                        </div>

                                        {report.weightChange !== undefined && (
                                            <div className="metric">
                                                <span className="metric-label">Peso</span>
                                                <span className={`metric-value ${report.weightChange > 0 ? 'positive' : report.weightChange < 0 ? 'negative' : ''}`}>
                                                    {report.weightChange > 0 ? '+' : ''}{report.weightChange.toFixed(1)}kg
                                                </span>
                                            </div>
                                        )}

                                        {report.avgDailyKcal > 0 && (
                                            <div className="metric">
                                                <span className="metric-label">Kcal Medie/Giorno</span>
                                                <span className="metric-value">{Math.round(report.avgDailyKcal)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="workout-days">
                                        <span className="workout-days-label">Giorni allenamento:</span>
                                        <div className="days-grid">
                                            {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day, dayIndex) => {
                                                const date = new Date(report.weekStart);
                                                date.setDate(date.getDate() + dayIndex);
                                                const dateStr = date.toISOString().split('T')[0];
                                                const hasWorkout = report.workoutDays.includes(dateStr);
                                                
                                                return (
                                                    <div key={day} className={`day-indicator ${hasWorkout ? 'active' : ''}`}>
                                                        {day}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {reportType === 'daily' && (
                <div className="daily-reports">
                    <div className="reports-list">
                        {dailyReports.slice(0, 14).map((report) => (
                            <div key={report.date} className="daily-report-card">
                                <div className="daily-report-header">
                                    <h4>
                                        {new Date(report.date).toLocaleDateString('it-IT', { 
                                            weekday: 'long', 
                                            day: 'numeric', 
                                            month: 'long' 
                                        })}
                                    </h4>
                                    <div className="daily-indicators">
                                        {report.workouts.length > 0 && (
                                            <span className="indicator workout-indicator">
                                                <span className="material-symbols-outlined">fitness_center</span>
                                                {report.workouts.length}
                                            </span>
                                        )}
                                        {report.measurement && (
                                            <span className="indicator measurement-indicator">
                                                <span className="material-symbols-outlined">monitor_weight</span>
                                                {report.measurement.weight}kg
                                            </span>
                                        )}
                                        {report.nutrition && (
                                            <span className="indicator nutrition-indicator">
                                                <span className="material-symbols-outlined">restaurant</span>
                                                {Math.round(report.nutrition.totalKcal)} kcal
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {(report.workouts.length > 0 || report.nutrition || report.measurement) && (
                                    <div className="daily-details">
                                        {report.workouts.length > 0 && (
                                            <div className="daily-section">
                                                <h5>Allenamenti</h5>
                                                {report.workouts.map(workout => (
                                                    <div key={workout.id} className="workout-summary">
                                                        <span>{workout.routineName}</span>
                                                        <span>{formatDuration(workout.duration)}</span>
                                                        <span>{workout.exercises.length} esercizi</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {report.nutrition && (
                                            <div className="daily-section">
                                                <h5>Nutrizione</h5>
                                                <div className="nutrition-summary">
                                                    <span>Kcal: {Math.round(report.nutrition.totalKcal)}</span>
                                                    <span>Proteine: {Math.round(report.nutrition.totalProtein)}g</span>
                                                    <span>Carbs: {Math.round(report.nutrition.totalCarbs)}g</span>
                                                    <span>Grassi: {Math.round(report.nutrition.totalFats)}g</span>
                                                    <span>{report.nutrition.mealsCount} pasti</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {report.workouts.length === 0 && !report.nutrition && !report.measurement && (
                                    <div className="daily-empty">
                                        <span>Nessuna attività registrata</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
