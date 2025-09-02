import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { NumberInput } from '../components/NumberInput';
import { WorkoutSession } from '../types/index';
import { formatDuration } from '../types/utils/helpers';

interface EditWorkoutSessionViewProps {
    session: WorkoutSession;
    onSave: (session: WorkoutSession) => void;
    onCancel: () => void;
}

export const EditWorkoutSessionView: React.FC<EditWorkoutSessionViewProps> = ({ session, onSave, onCancel }) => {
    const [editedSession, setEditedSession] = useState<WorkoutSession>(session);

    useEffect(() => {
        setEditedSession(session);
    }, [session]);

    const handleFieldChange = (field: 'routineName' | 'date' | 'duration', value: string | number) => {
        setEditedSession(prev => ({ ...prev, [field]: value }));
    };

    const handleSetChange = (exIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
        const newExercises = [...editedSession.exercises];
        const currentSet = newExercises[exIndex].sets[setIndex] || { weight: 0, reps: 0 };
        
        newExercises[exIndex].sets[setIndex] = { ...currentSet, [field]: value };
        setEditedSession(prev => ({ ...prev, exercises: newExercises }));
    };

    const handleSave = () => {
        onSave(editedSession);
    };

    return (
        <div className="edit-session-view">
            <Header 
                title="Modifica Allenamento" 
                onLogoClick={onCancel}
                actions={<button className="btn-primary save-btn" onClick={handleSave}>Salva</button>}
            />
            <div className="main-content">
                <div className="card">
                    <div className="edit-session-form">
                        <div className="form-group">
                            <label htmlFor="routineName">Nome Scheda</label>
                            <input
                                type="text"
                                id="routineName"
                                value={editedSession.routineName}
                                onChange={(e) => handleFieldChange('routineName', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="date">Data</label>
                            <input
                                type="date"
                                id="date"
                                value={editedSession.date}
                                onChange={(e) => handleFieldChange('date', e.target.value)}
                            />
                        </div>
                    </div>
                     <div className="form-group">
                        <label htmlFor="duration">Durata (secondi) - {formatDuration(editedSession.duration)}</label>
                        <input
                            type="number"
                            id="duration"
                            value={editedSession.duration}
                            onChange={(e) => handleFieldChange('duration', parseInt(e.target.value, 10) || 0)}
                        />
                    </div>
                </div>

                {(editedSession.exercises || []).map((ex, exIndex) => (
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
        </div>
    );
};