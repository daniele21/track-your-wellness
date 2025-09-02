
import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { NumberInput } from '../components/NumberInput';
import { WorkoutSession } from '../types/index';
import { formatDuration } from '../types/utils/helpers';

interface ActiveWorkoutSessionProps {
    session: WorkoutSession;
    onUpdateSession: (session: WorkoutSession) => void;
    onFinishSession: (session: WorkoutSession) => void;
}

export const ActiveWorkoutSession: React.FC<ActiveWorkoutSessionProps> = ({ session, onUpdateSession, onFinishSession }) => {
    const [duration, setDuration] = useState(session.duration);
    const [restTimer, setRestTimer] = useState(0);
    const [isTimerSetupVisible, setIsTimerSetupVisible] = useState(false);
    const [customRestTime, setCustomRestTime] = useState(90);
    
    const isFinishingRef = useRef(false);

    // Main session duration timer
    useEffect(() => {
        const startTime = Date.now() - (session.duration * 1000);
        
        const intervalId = window.setInterval(() => {
            const newDuration = Math.floor((Date.now() - startTime) / 1000);
            if (!isFinishingRef.current) {
                setDuration(newDuration);
            }
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [session.id]); // Dependency on session.id ensures it resets only for a new session

    // Rest timer
    useEffect(() => {
        if (restTimer <= 0) {
            return;
        }

        const intervalId = window.setInterval(() => {
            if (!isFinishingRef.current) {
                setRestTimer(prev => Math.max(0, prev - 1));
            }
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [restTimer]); // Reruns when restTimer value changes


    const handleSetChange = (exIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
        if (isFinishingRef.current) {
            return;
        }
        const newExercises = [...session.exercises];
        const currentSet = newExercises[exIndex].sets[setIndex] || { weight: 0, reps: 0 };
        
        newExercises[exIndex].sets[setIndex] = { ...currentSet, [field]: value };
        onUpdateSession({ ...session, exercises: newExercises });
    };

    const handleFinish = () => {
        if (window.confirm("Sei sicuro di voler terminare l'allenamento?")) {
            isFinishingRef.current = true;
            
            const finalSession = { ...session, duration };
            onFinishSession(finalSession);
        }
    };
    
    const startRestTimer = (seconds: number) => {
        if (seconds > 0) {
            setRestTimer(seconds);
            setIsTimerSetupVisible(false);
        }
    };

    const handleStartCustomTimer = () => {
        if (customRestTime > 0) {
            startRestTimer(customRestTime);
        }
    };
    
    const handleAddRestTime = () => {
        setRestTimer(t => t + 15);
    };
    
    const handleCancelRestTimer = () => {
        setRestTimer(0);
    };
    
    return (
        <div className="active-session">
            <Header title={session.routineName} actions={
                <button className="btn-primary save-btn" onClick={handleFinish}>Termina</button>
            }/>
            <div className="main-content">
                 {(session.exercises || []).map((ex, exIndex) => (
                    <div key={ex.exerciseId} className="card exercise-log-card">
                        <h4>{ex.name} <span className="target-reps">({ex.targetSets}x{ex.targetReps})</span></h4>
                        <div className="set-log-header">
                            <span>SERIE</span><span>PESO (KG)</span><span>REP</span>
                        </div>
                        {Array.from({ length: ex.targetSets }).map((_, setIndex) => (
                            <div key={setIndex} className="set-log-row">
                                <span className="set-number">{setIndex + 1}</span>
                                <NumberInput
                                    value={ex.sets[setIndex]?.weight || 0}
                                    onChange={val => handleSetChange(exIndex, setIndex, 'weight', val)}
                                    step={1}
                                />
                                <NumberInput
                                    value={ex.sets[setIndex]?.reps || 0}
                                    onChange={val => handleSetChange(exIndex, setIndex, 'reps', val)}
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="session-timer-bar">
                <div className="stopwatch">
                    <span className="material-symbols-outlined">timer</span>
                    <span>{formatDuration(duration)}</span>
                </div>
                 
                {restTimer > 0 ? (
                    <div className="active-timer-controls">
                        <span className="timer-display">{formatDuration(restTimer)}</span>
                        <button onClick={handleAddRestTime}>+15s</button>
                        <button onClick={handleCancelRestTimer} className="timer-cancel-btn" aria-label="Annulla timer">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                ) : (
                    <div className="rest-timer-starter">
                        <button className="btn-secondary" onClick={() => setIsTimerSetupVisible(true)}>
                            <span className="material-symbols-outlined">hourglass_top</span>
                            Inizia Riposo
                        </button>
                    </div>
                )}
            </div>

            {isTimerSetupVisible && (
                <div className="timer-setup-overlay" onClick={() => setIsTimerSetupVisible(false)}>
                    <div className="timer-setup-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Imposta Timer Riposo</h3>
                        <div className="timer-presets">
                            <button onClick={() => startRestTimer(60)}>1:00</button>
                            <button onClick={() => startRestTimer(90)}>1:30</button>
                            <button onClick={() => startRestTimer(120)}>2:00</button>
                            <button onClick={() => startRestTimer(180)}>3:00</button>
                        </div>
                        <div className="custom-timer-setup">
                            <label htmlFor="custom-rest-time">Tempo personalizzato (secondi):</label>
                            <NumberInput 
                                value={customRestTime}
                                onChange={setCustomRestTime}
                                step={15}
                                min={0}
                            />
                        </div>
                        <div className="timer-setup-actions">
                            <button className="btn-secondary" onClick={() => setIsTimerSetupVisible(false)}>Annulla</button>
                            <button className="btn-primary" onClick={handleStartCustomTimer}>Inizia</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};