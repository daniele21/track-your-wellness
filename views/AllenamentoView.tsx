
import React, { useState } from 'react';
import { RoutineImportModal } from '../components/RoutineImportModal';
import { WorkoutRoutine, WorkoutSession, NutritionGoals } from '../types/index';
import { generateUniqueId, formatDuration } from '../types/utils/helpers';
import { analyzeWorkoutPlanWithGemini } from '../services/geminiService';

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
    const [tab, setTab] = useState<'schede' | 'storico'>('schede');
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');

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
                <button className={tab === 'schede' ? 'active' : ''} onClick={() => setTab('schede')}>Schede</button>
                <button className={tab === 'storico' ? 'active' : ''} onClick={() => setTab('storico')}>Storico</button>
            </div>
            
            {tab === 'schede' && (
                <div>
                    {routines.length > 0 ? routines.map(routine => (
                        <div className="card routine-card" key={routine.id}>
                            <div className="routine-info">
                                <h4>{routine.name}</h4>
                                {routine.description && <p className="routine-description">{routine.description}</p>}
                                <p>{(routine.exercises || []).length} esercizi</p>
                            </div>
                            <div className="routine-actions">
                                <button onClick={() => handleDeleteRoutine(routine.id)} className="btn-danger-icon" aria-label={`Elimina scheda ${routine.name}`}>
                                     <span className="material-symbols-outlined">delete</span>
                                </button>
                                <button className="btn-primary" onClick={() => onStartWorkout(routine)}>Inizia</button>
                            </div>
                        </div>
                    )) : (
                        <div className="card empty-state"><p>Nessuna scheda di allenamento. Importane una per iniziare!</p></div>
                    )}
                     <div className="page-actions-container">
                        <button className="btn-secondary" onClick={() => setImportModalOpen(true)}>
                            <span className="material-symbols-outlined">upload</span>
                            Importa con AI
                        </button>
                        <button className="btn-secondary" onClick={handleAnalyzeWorkoutPlan} disabled={isAnalyzing}>
                            <span className="material-symbols-outlined">psychology</span>
                            {isAnalyzing ? "Analizzando..." : "Valuta Piano"}
                        </button>
                    </div>
                    {analysisResult && (
                        <div className="card" style={{marginTop: '16px'}}>
                            <h4>Valutazione del Piano di Allenamento</h4>
                            <div style={{whiteSpace: 'pre-wrap', lineHeight: '1.6'}}>{analysisResult}</div>
                        </div>
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
            
            <RoutineImportModal isOpen={isImportModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleImport}/>
        </>
    );
};