
import React, { useState } from 'react';
import { RoutineImportModal } from '../components/RoutineImportModal';
import { WorkoutCalendar } from '../components/WorkoutCalendar';
import { WorkoutSearch } from '../components/WorkoutSearch';
import { ExerciseAnalytics } from '../components/ExerciseAnalytics';
import { WorkoutLibrary } from '../components/WorkoutLibrary';
import { WorkoutRoutine, WorkoutSession, NutritionGoals } from '../types/index';
import { generateUniqueId, formatDuration } from '../types/utils/helpers';
import { analyzeWorkoutPlanWithGemini } from '../services/geminiService';
import { EditRoutineModal } from '../components/EditRoutineModal';

interface AllenamentoViewProps {
    routines: WorkoutRoutine[];
    history: WorkoutSession[];
    goals: NutritionGoals;
    onSaveRoutines: (routines: WorkoutRoutine[]) => void;
    onStartWorkout: (routine: WorkoutRoutine) => void;
    onEditSession: (session: WorkoutSession) => void;
    onDeleteSession: (sessionId: string) => void;
}

export const AllenamentoView: React.FC<AllenamentoViewProps> = ({ routines, history, goals, onSaveRoutines, onStartWorkout, onEditSession, onDeleteSession }) => {
    const [tab, setTab] = useState<'libreria' | 'schede' | 'storico' | 'calendario' | 'ricerca' | 'analisi'>('libreria');
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [editRoutineModalOpen, setEditRoutineModalOpen] = useState(false);
    const [routineToEdit, setRoutineToEdit] = useState<WorkoutRoutine | null>(null);
    const [expandedRoutines, setExpandedRoutines] = useState<Set<string>>(new Set());
    const [selectedDate, setSelectedDate] = useState<string>('');

    const toggleRoutineExpansion = (routineId: string) => {
        const newExpanded = new Set(expandedRoutines);
        if (newExpanded.has(routineId)) {
            newExpanded.delete(routineId);
        } else {
            newExpanded.add(routineId);
        }
        setExpandedRoutines(newExpanded);
    };

    const handleImport = (importedRoutines: Omit<WorkoutRoutine, 'id'>[]) => {
        const newRoutines: WorkoutRoutine[] = importedRoutines.map(r => ({
            ...r,
            id: generateUniqueId(),
            exercises: (r.exercises || []).map(ex => ({...ex, id: generateUniqueId()}))
        }));
        onSaveRoutines([...routines, ...newRoutines]);
    };

    const handleDeleteRoutine = (id: string) => {
        if(window.confirm("Sei sicuro di voler eliminare questa scheda?")){
            onSaveRoutines(routines.filter(r => r.id !== id));
        }
    }

    const handleEditRoutine = (routine: WorkoutRoutine) => {
        setRoutineToEdit(routine);
        setEditRoutineModalOpen(true);
    };

    const handleSaveEditedRoutine = (updatedRoutine: WorkoutRoutine) => {
        onSaveRoutines(routines.map(r => r.id === updatedRoutine.id ? updatedRoutine : r));
        setEditRoutineModalOpen(false);
        setRoutineToEdit(null);
    };

    const handleAnalyzeWorkoutPlan = async () => {
        if (routines.length === 0) {
            alert("Aggiungi almeno una scheda di allenamento per ottenere una valutazione.");
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResult('');
        try {
            const analysis = await analyzeWorkoutPlanWithGemini(routines, history, goals);
            setAnalysisResult(analysis);
        } catch (error: any) {
            console.error("Failed to analyze workout plan:", error);
            alert(error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <>
            <div className="workout-tabs">
                <button className={tab === 'libreria' ? 'active' : ''} onClick={() => setTab('libreria')}>
                    <span className="material-symbols-outlined tab-icon">library_books</span>
                    <span className="tab-text-full">Libreria</span>
                    <span className="tab-text-short">Lib</span>
                </button>
                <button className={tab === 'schede' ? 'active' : ''} onClick={() => setTab('schede')}>
                    <span className="material-symbols-outlined tab-icon">fitness_center</span>
                    <span className="tab-text-full">Le Mie Schede</span>
                    <span className="tab-text-short">Mie</span>
                </button>
                <button className={tab === 'storico' ? 'active' : ''} onClick={() => setTab('storico')}>
                    <span className="material-symbols-outlined tab-icon">history</span>
                    <span className="tab-text-full">Storico</span>
                    <span className="tab-text-short">Stor</span>
                </button>
                <button className={tab === 'calendario' ? 'active' : ''} onClick={() => setTab('calendario')}>
                    <span className="material-symbols-outlined tab-icon">calendar_month</span>
                    <span className="tab-text-full">Calendario</span>
                    <span className="tab-text-short">Cal</span>
                </button>
                <button className={tab === 'ricerca' ? 'active' : ''} onClick={() => setTab('ricerca')}>
                    <span className="material-symbols-outlined tab-icon">search</span>
                    <span className="tab-text-full">Ricerca</span>
                    <span className="tab-text-short">Ric</span>
                </button>
                <button className={tab === 'analisi' ? 'active' : ''} onClick={() => setTab('analisi')}>
                    <span className="material-symbols-outlined tab-icon">analytics</span>
                    <span className="tab-text-full">Analisi</span>
                    <span className="tab-text-short">Ana</span>
                </button>
            </div>
            
            {tab === 'libreria' && (
                <WorkoutLibrary
                    userRoutines={routines}
                    onSelectRoutine={(routine) => {
                        // Switch to schede tab and expand the routine
                        setTab('schede');
                        setExpandedRoutines(new Set([routine.id]));
                    }}
                    onStartWorkout={onStartWorkout}
                    onEditRoutine={(routine) => {
                        if (!routine.isPreset) {
                            setRoutineToEdit(routine);
                            setEditRoutineModalOpen(true);
                        }
                    }}
                    onDeleteRoutine={(routineId) => {
                        const updatedRoutines = routines.filter(r => r.id !== routineId);
                        onSaveRoutines(updatedRoutines);
                    }}
                />
            )}
            
            {tab === 'schede' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px', gap: '12px' }}>
                        <button className="action-card new-card" style={{ minWidth: '180px', boxShadow: '0 4px 16px rgba(16,185,129,0.08)', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 24px', borderRadius: '14px', transition: 'all 0.2s' }} onClick={() => setEditRoutineModalOpen(true)}>
                            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>add</span>
                            Nuova Scheda
                        </button>
                        <button className="action-card import-card" style={{ minWidth: '180px', boxShadow: '0 4px 16px rgba(59,130,246,0.08)', border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 24px', borderRadius: '14px', transition: 'all 0.2s' }} onClick={() => setImportModalOpen(true)}>
                            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>upload</span>
                            Importa Scheda
                        </button>
                    </div>
                    {routines.length > 0 ? routines.map(routine => (
                        <div className="card routine-card" key={routine.id}>
                            <div className="routine-card-header">
                                <div className="routine-info">
                                    <div className="routine-title-section" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
                                        <h4 style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: '0 1 auto' }}>{routine.name}</h4>
                                        {/* <div className="routine-status-badge" style={{ flexShrink: 0 }}>
                                            <span className="material-symbols-outlined">verified</span>
                                            Importata
                                        </div> */}
                                    </div>
                                    {routine.description && (
                                        <p className="routine-description">{routine.description}</p>
                                    )}
                                    <div className="routine-meta">
                                        <div className="routine-meta-item">
                                            <span className="material-symbols-outlined">fitness_center</span>
                                            <span>{(routine.exercises || []).length} esercizi</span>
                                        </div>
                                        <div className="routine-meta-item">
                                            <span className="material-symbols-outlined">schedule</span>
                                            <span>~{Math.max(30, (routine.exercises || []).length * 5)} min</span>
                                        </div>
                                        <div className="routine-meta-item difficulty">
                                            <span className="material-symbols-outlined">trending_up</span>
                                            <span>Intermedio</span>
                                        </div>
                                    </div>
                                    <div className="routine-actions-row" style={{ width: '100%', marginTop: '18px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                                        <button 
                                            className="expand-toggle" 
                                            onClick={() => toggleRoutineExpansion(routine.id)}
                                            aria-label={expandedRoutines.has(routine.id) ? 'Comprimi dettagli' : 'Espandi dettagli'}
                                        >
                                            <span className="material-symbols-outlined">
                                                {expandedRoutines.has(routine.id) ? 'expand_less' : 'expand_more'}
                                            </span>
                                        </button>
                                        <div className="routine-actions" style={{ gap: '8px' }}>
                                            <button onClick={() => handleEditRoutine(routine)} className="btn-edit" aria-label={`Modifica scheda ${routine.name}`}> 
                                                <span className="material-symbols-outlined">edit</span>
                                                <span>Modifica</span>
                                            </button>
                                            <button className="btn-primary btn-start" onClick={() => onStartWorkout(routine)}>
                                                <span className="material-symbols-outlined">play_arrow</span>
                                                <span>Inizia Allenamento</span>
                                            </button>
                                            <button onClick={() => handleDeleteRoutine(routine.id)} className="btn-danger-icon btn-delete" aria-label={`Elimina scheda ${routine.name}`}> 
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {expandedRoutines.has(routine.id) && (
                                <div className="routine-exercises">
                                    <div className="exercises-header">
                                        <h5>Lista Esercizi</h5>
                                        <div className="exercises-count">
                                            {routine.exercises.length} / {routine.exercises.length} esercizi
                                        </div>
                                    </div>
                                    <div className="exercises-grid">
                                        {routine.exercises.map((exercise, index) => (
                                            <div key={exercise.id} className="exercise-item">
                                                <div className="exercise-number">
                                                    {index + 1}
                                                </div>
                                                <div className="exercise-content">
                                                    <div className="exercise-name">
                                                        {exercise.name || 'Esercizio senza nome'}
                                                    </div>
                                                    <div className="exercise-details">
                                                        <div className="exercise-stat sets">
                                                            <span className="material-symbols-outlined">repeat</span>
                                                            <span>{exercise.sets} serie</span>
                                                        </div>
                                                        <div className="exercise-stat reps">
                                                            <span className="material-symbols-outlined">fitness_center</span>
                                                            <span>{exercise.reps} reps</span>
                                                        </div>
                                                    </div>
                                                    {exercise.notes && (
                                                        <div className="exercise-notes-preview">
                                                            <span className="material-symbols-outlined">lightbulb</span>
                                                            <span>{exercise.notes}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {routine.exercises.length === 0 && (
                                        <div className="empty-exercises-state">
                                            <span className="material-symbols-outlined">fitness_center</span>
                                            <h6>Nessun esercizio definito</h6>
                                            <p>Clicca "Modifica" per aggiungere esercizi a questa scheda</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="empty-workout-state">
                            <div className="empty-state-icon">
                                <span className="material-symbols-outlined">fitness_center</span>
                            </div>
                            <h3>Nessuna Scheda di Allenamento</h3>
                            <p>Importa una scheda con l'AI per iniziare il tuo percorso di allenamento</p>
                            <button className="btn-primary" onClick={() => setImportModalOpen(true)}>
                                <span className="material-symbols-outlined">upload</span>
                                Importa Prima Scheda
                            </button>
                        </div>
                    )}
                    <div className="workout-actions-section">
                        {/* <div className="actions-grid"> */}
                            {/* <button className="action-card import-card" onClick={() => setImportModalOpen(true)}>
                                <div className="action-icon">
                                    <span className="material-symbols-outlined">upload</span>
                                </div>
                                <div className="action-content">
                                    <h4>Importa Scheda</h4>
                                    <p>Usa l'AI per creare nuove schede personalizzate</p>
                                </div>
                            </button> */}
                            
                            <button className="action-card analyze-card" onClick={handleAnalyzeWorkoutPlan} disabled={isAnalyzing}>
                                <div className="action-icon">
                                    <span className="material-symbols-outlined">psychology</span>
                                </div>
                                <div className="action-content">
                                    <h4>{isAnalyzing ? "Analizzando..." : "Valuta Piano"}</h4>
                                    <p>Ottieni feedback personalizzato sulle tue schede</p>
                                </div>
                            </button>
                        {/* </div> */}
                    </div>
                    {analysisResult && (
                        <div className="card" style={{marginTop: '16px'}}>
                            <h4>Valutazione del Piano di Allenamento</h4>
                            <div style={{whiteSpace: 'pre-wrap', lineHeight: '1.6'}}>{analysisResult}</div>
                        </div>
                    )}
                    {/* Edit Routine Modal */}
                    {editRoutineModalOpen && (
                        <EditRoutineModal
                            isOpen={editRoutineModalOpen}
                            routine={routineToEdit || { 
                                id: '', 
                                name: '', 
                                description: '', 
                                exercises: [],
                                category: 'altro' as const,
                                difficulty: 'intermedio' as const
                            }}
                            onClose={() => { setEditRoutineModalOpen(false); setRoutineToEdit(null); }}
                            onSave={routine => {
                                if (!routine.id) {
                                    // New routine, assign id and add
                                    const newRoutine = { ...routine, id: generateUniqueId(), exercises: (routine.exercises || []).map(ex => ({...ex, id: generateUniqueId()})) };
                                    onSaveRoutines([...routines, newRoutine]);
                                } else {
                                    handleSaveEditedRoutine(routine);
                                }
                                setEditRoutineModalOpen(false);
                                setRoutineToEdit(null);
                            }}
                        />
                    )}
                </div>
            )}
            
            {tab === 'storico' && (
                <div>
                    {history.length > 0 ? [...history].reverse().map(session => (
                        <div className="card" key={session.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h4>{session.routineName}</h4>
                                    <p className="routine-info">
                                        {new Date(session.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>
                                    <div className="session-duration">
                                       <span className="material-symbols-outlined">timer</span>
                                       <span>{formatDuration(session.duration)}</span>
                                    </div>
                                </div>
                                <div className="session-history-card-actions">
                                    <button className="btn-secondary" style={{padding: '6px 12px'}} onClick={() => onEditSession(session)}>Modifica</button>
                                    <button className="btn-danger-icon" onClick={() => onDeleteSession(session.id)} aria-label={`Elimina sessione del ${session.date}`}>
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                         <div className="card empty-state"><p>Nessun allenamento registrato.</p></div>
                    )}
                </div>
            )}
            
            {tab === 'calendario' && (
                <WorkoutCalendar 
                    workoutSessions={history}
                    onDateSelect={(date: string) => {
                        // Optional: filter to show sessions for selected date
                        console.log('Selected date:', date);
                    }}
                />
            )}
            
            {tab === 'ricerca' && (
                <WorkoutSearch 
                    workoutSessions={history}
                    onSessionSelect={onEditSession}
                    onEditSession={onEditSession}
                    onDeleteSession={onDeleteSession}
                />
            )}
            
            {tab === 'analisi' && (
                <ExerciseAnalytics 
                    workoutSessions={history}
                />
            )}
            
            <RoutineImportModal isOpen={isImportModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleImport}/>
        </>
    );
};