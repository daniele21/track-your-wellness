import React, { useState, useMemo } from 'react';
import { WorkoutSession, LoggedExercise } from '../types/index';
import { formatDuration } from '../types/utils/helpers';

interface ExerciseAnalyticsProps {
    workoutSessions: WorkoutSession[];
}

interface ExerciseData {
    name: string;
    sessions: {
        date: string;
        sessionName: string;
        sets: {
            weight: number;
            reps: number;
            date: string;
        }[];
    }[];
}

export const ExerciseAnalytics: React.FC<ExerciseAnalyticsProps> = ({ workoutSessions }) => {
    const [selectedExercise, setSelectedExercise] = useState<string>('');
    const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');

    // Aggregate exercise data from all sessions
    const exerciseData = useMemo(() => {
        const dataMap = new Map<string, ExerciseData>();

        workoutSessions.forEach(session => {
            session.exercises.forEach(exercise => {
                const exerciseName = exercise.name;
                
                if (!dataMap.has(exerciseName)) {
                    dataMap.set(exerciseName, {
                        name: exerciseName,
                        sessions: []
                    });
                }

                const exerciseData = dataMap.get(exerciseName)!;
                const sessionData = {
                    date: session.date,
                    sessionName: session.routineName,
                    sets: exercise.sets.map(set => ({
                        weight: set.weight,
                        reps: set.reps,
                        date: session.date
                    }))
                };

                exerciseData.sessions.push(sessionData);
            });
        });

        // Sort sessions by date for each exercise
        dataMap.forEach(data => {
            data.sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        });

        return Array.from(dataMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [workoutSessions]);

    const selectedExerciseData = useMemo(() => {
        return exerciseData.find(data => data.name === selectedExercise);
    }, [exerciseData, selectedExercise]);

    const getMaxWeight = (exerciseData: ExerciseData) => {
        return Math.max(...exerciseData.sessions.flatMap(session => 
            session.sets.map(set => set.weight)
        ));
    };

    const getMaxReps = (exerciseData: ExerciseData) => {
        return Math.max(...exerciseData.sessions.flatMap(session => 
            session.sets.map(set => set.reps)
        ));
    };

    const getAverageWeight = (exerciseData: ExerciseData) => {
        const allWeights = exerciseData.sessions.flatMap(session => 
            session.sets.map(set => set.weight)
        );
        return allWeights.length > 0 ? allWeights.reduce((a, b) => a + b, 0) / allWeights.length : 0;
    };

    const getTotalVolume = (exerciseData: ExerciseData) => {
        return exerciseData.sessions.reduce((total, session) => {
            return total + session.sets.reduce((sessionTotal, set) => {
                return sessionTotal + (set.weight * set.reps);
            }, 0);
        }, 0);
    };

    const getProgressionTrend = (exerciseData: ExerciseData) => {
        if (exerciseData.sessions.length < 2) return 'stable';
        
        const firstSessionMax = Math.max(...exerciseData.sessions[0].sets.map(set => set.weight));
        const lastSessionMax = Math.max(...exerciseData.sessions[exerciseData.sessions.length - 1].sets.map(set => set.weight));
        
        if (lastSessionMax > firstSessionMax) return 'increasing';
        if (lastSessionMax < firstSessionMax) return 'decreasing';
        return 'stable';
    };

    return (
        <div className="exercise-analytics">
            <div className="analytics-header">
                <h3>Analisi Esercizi</h3>
                <div className="analytics-controls">
                    <div className="view-toggle">
                        <button 
                            className={viewMode === 'list' ? 'active' : ''}
                            onClick={() => setViewMode('list')}
                        >
                            <span className="material-symbols-outlined">list</span>
                            Lista
                        </button>
                        <button 
                            className={viewMode === 'chart' ? 'active' : ''}
                            onClick={() => setViewMode('chart')}
                        >
                            <span className="material-symbols-outlined">analytics</span>
                            Grafico
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'list' && (
                <div className="exercise-list">
                    {exerciseData.length > 0 ? (
                        <div className="exercises-grid">
                            {exerciseData.map(exercise => {
                                const trend = getProgressionTrend(exercise);
                                const maxWeight = getMaxWeight(exercise);
                                const maxReps = getMaxReps(exercise);
                                const avgWeight = getAverageWeight(exercise);
                                const totalVolume = getTotalVolume(exercise);

                                return (
                                    <div 
                                        key={exercise.name} 
                                        className={`exercise-analytics-card ${selectedExercise === exercise.name ? 'selected' : ''}`}
                                        onClick={() => setSelectedExercise(selectedExercise === exercise.name ? '' : exercise.name)}
                                    >
                                        <div className="exercise-analytics-header">
                                            <h4>{exercise.name}</h4>
                                            <div className={`trend-indicator ${trend}`}>
                                                <span className="material-symbols-outlined">
                                                    {trend === 'increasing' ? 'trending_up' : 
                                                     trend === 'decreasing' ? 'trending_down' : 'trending_flat'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="exercise-stats">
                                            <div className="stat">
                                                <span className="stat-label">Sessioni</span>
                                                <span className="stat-value">{exercise.sessions.length}</span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-label">Max Peso</span>
                                                <span className="stat-value">{maxWeight}kg</span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-label">Max Reps</span>
                                                <span className="stat-value">{maxReps}</span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-label">Peso Medio</span>
                                                <span className="stat-value">{avgWeight.toFixed(1)}kg</span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-label">Volume Totale</span>
                                                <span className="stat-value">{totalVolume.toLocaleString()}kg</span>
                                            </div>
                                        </div>

                                        {selectedExercise === exercise.name && (
                                            <div className="exercise-detailed-sessions">
                                                <h5>Storico Sessioni</h5>
                                                {exercise.sessions.map((session, sessionIndex) => (
                                                    <div key={sessionIndex} className="session-detail">
                                                        <div className="session-info">
                                                            <span className="session-date">
                                                                {new Date(session.date).toLocaleDateString('it-IT')}
                                                            </span>
                                                            <span className="session-name">{session.sessionName}</span>
                                                        </div>
                                                        <div className="session-sets">
                                                            {session.sets.map((set, setIndex) => (
                                                                <div key={setIndex} className="set-detail">
                                                                    <span>{set.weight}kg × {set.reps}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <span className="material-symbols-outlined">fitness_center</span>
                            <p>Nessun dato di esercizio disponibile</p>
                            <small>Completa alcuni allenamenti per vedere le analisi</small>
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'chart' && selectedExerciseData && (
                <div className="exercise-chart">
                    <div className="chart-header">
                        <h4>Progressione: {selectedExerciseData.name}</h4>
                        <select 
                            value={selectedExercise} 
                            onChange={(e) => setSelectedExercise(e.target.value)}
                            className="exercise-selector"
                        >
                            <option value="">Seleziona esercizio</option>
                            {exerciseData.map(exercise => (
                                <option key={exercise.name} value={exercise.name}>
                                    {exercise.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="simple-chart">
                        {selectedExerciseData.sessions.map((session, index) => {
                            const maxWeight = Math.max(...session.sets.map(set => set.weight));
                            const totalReps = session.sets.reduce((sum, set) => sum + set.reps, 0);
                            const volume = session.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
                            
                            return (
                                <div key={index} className="chart-point">
                                    <div className="chart-date">
                                        {new Date(session.date).toLocaleDateString('it-IT', { 
                                            day: 'numeric', 
                                            month: 'short' 
                                        })}
                                    </div>
                                    <div className="chart-bars">
                                        <div 
                                            className="chart-bar weight-bar" 
                                            style={{ 
                                                height: `${(maxWeight / getMaxWeight(selectedExerciseData)) * 100}%` 
                                            }}
                                            title={`Peso massimo: ${maxWeight}kg`}
                                        />
                                        <div 
                                            className="chart-bar reps-bar" 
                                            style={{ 
                                                height: `${(totalReps / (getMaxReps(selectedExerciseData) * selectedExerciseData.sessions[0].sets.length)) * 100}%` 
                                            }}
                                            title={`Ripetizioni totali: ${totalReps}`}
                                        />
                                    </div>
                                    <div className="chart-values">
                                        <div className="weight-value">{maxWeight}kg</div>
                                        <div className="reps-value">{totalReps} reps</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="chart-legend">
                        <div className="legend-item">
                            <div className="legend-color weight-bar"></div>
                            <span>Peso Massimo</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color reps-bar"></div>
                            <span>Ripetizioni Totali</span>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'chart' && !selectedExerciseData && (
                <div className="chart-empty-state">
                    <span className="material-symbols-outlined">analytics</span>
                    <p>Seleziona un esercizio per vedere il grafico</p>
                    <select 
                        value={selectedExercise} 
                        onChange={(e) => setSelectedExercise(e.target.value)}
                        className="exercise-selector"
                    >
                        <option value="">Seleziona esercizio</option>
                        {exerciseData.map(exercise => (
                            <option key={exercise.name} value={exercise.name}>
                                {exercise.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};
