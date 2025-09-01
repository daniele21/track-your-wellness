import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { NumberInput } from '../components/NumberInput';
import { WorkoutSession } from '../types/index';
import { formatDuration } from '../utils/helpers';

interface ActiveWorkoutSessionProps {
    session: WorkoutSession;
    onUpdateSession: (session: WorkoutSession) => void;
    onFinishSession: (session: WorkoutSession) => void;
}

export const ActiveWorkoutSession: React.FC<ActiveWorkoutSessionProps> = ({ session, onUpdateSession, onFinishSession }) => {
    console.log('ActiveWorkoutSession: Component rendered.');

    const [duration, setDuration] = useState(session.duration);
    const [restTimer, setRestTimer] = useState(0);
    const [customRestTime, setCustomRestTime] = useState('');
    
    const isFinishingRef = useRef(false);

    // Main session duration timer
    useEffect(() => {
        console.log('ActiveWorkoutSession: Duration timer effect setup.');
        const startTime = Date.now() - (session.duration * 1000);
        
        const intervalId = window.setInterval(() => {
            const newDuration = Math.floor((Date.now() - startTime) / 1000);
            console.log(`ActiveWorkoutSession: Duration tick. isFinishing: ${isFinishingRef.current}, new duration: ${newDuration}`);
            if (!isFinishingRef.current) {
                setDuration(newDuration);
            }
        }, 1000);

        return () => {
            console.log('ActiveWorkoutSession: Duration timer effect cleanup. Clearing interval.');
            clearInterval(intervalId);
        };
    }, [session.id]); // Dependency on session.id ensures it resets only for a new session

    // Rest timer
    useEffect(() => {
        console.log(`ActiveWorkoutSession: Rest timer effect setup. Current rest timer: ${restTimer}`);
        if (restTimer <= 0) {
            return;
        }

        const intervalId = window.setInterval(() => {
            console.log(`ActiveWorkoutSession: Rest timer tick. isFinishing: ${isFinishingRef.current}`);
            if (!isFinishingRef.current) {
                setRestTimer(prev => {
                    const newTime = Math.max(0, prev - 1);
                    console.log(`ActiveWorkoutSession: New rest time: ${newTime}`);
                    return newTime;
                });
            }
        }, 1000);

        return () => {
            console.log('ActiveWorkoutSession: Rest timer effect cleanup. Clearing interval.');
            clearInterval(intervalId);
        };
    }, [restTimer]); // Reruns when restTimer value changes


    const handleSetChange = (exIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
        if (isFinishingRef.current) {
            console.log('ActiveWorkoutSession: handleSetChange blocked by isFinishingRef.');
            return;
        }
        const newExercises = [...session.exercises];
        const currentSet = newExercises[exIndex].sets[setIndex] || { weight: 0, reps: 0 };
        
        newExercises[exIndex].sets[setIndex] = { ...currentSet, [field]: value };
        onUpdateSession({ ...session, exercises: newExercises });
    };

    const handleFinish = () => {
        console.log('ActiveWorkoutSession: handleFinish called.');
        if (window.confirm("Sei sicuro di voler terminare l'allenamento?")) {
            console.log('ActiveWorkoutSession: User confirmed finish. Setting isFinishingRef to true.');
            isFinishingRef.current = true;
            
            const finalSession = { ...session, duration };
            console.log('ActiveWorkoutSession: Calling onFinishSession with final session:', finalSession);
            onFinishSession(finalSession);
        } else {
            console.log('ActiveWorkoutSession: User cancelled finish.');
        }
    };
    
    const startRestTimer = (seconds: number) => {
        if (seconds > 0) {
            console.log(`ActiveWorkoutSession: Starting rest timer for ${seconds} seconds.`);
            setRestTimer(seconds);
        }
    };

    const handleStartCustomTimer = () => {
        const time = parseInt(customRestTime, 10);
        if (!isNaN(time) && time > 0) {
            startRestTimer(time);
            setCustomRestTime('');
        }
    };
    
    const handleResetTimer = () => {
        console.log('ActiveWorkoutSession: Resetting rest timer.');
        setRestTimer(0);
    };
    
    const REST_TIMES = [60, 90, 120];

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
                 <div className="rest-timer-controls">
                    {restTimer > 0 ? (
                        <div className="active-timer-display">
                            <span className="timer-display">{formatDuration(restTimer)}</span>
                            <button onClick={handleResetTimer} className="timer-reset-btn" aria-label="Resetta timer">
                                <span className="material-symbols-outlined">replay</span>
                            </button>
                        </div>

                    ) : (
                        <>
                            {REST_TIMES.map(time => (
                                <button key={time} onClick={() => startRestTimer(time)}>{time}s</button>
                            ))}
                            <div className="custom-timer-controls">
                                <input 
                                    type="number" 
                                    value={customRestTime}
                                    onChange={(e) => setCustomRestTime(e.target.value)}
                                    placeholder="secs"
                                    aria-label="Tempo di riposo personalizzato in secondi"
                                />
                                <button onClick={handleStartCustomTimer} className="btn-primary" style={{padding: '6px'}}>Vai</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
