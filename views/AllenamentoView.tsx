import React, { useState } from 'react';
import { RoutineImportModal } from '../components/RoutineImportModal';
import { WorkoutRoutine, WorkoutSession } from '../types/index';
import { generateUniqueId, formatDuration } from '../utils/helpers';

interface AllenamentoViewProps {
    routines: WorkoutRoutine[];
    history: WorkoutSession[];
    onSaveRoutines: (routines: WorkoutRoutine[]) => void;
    onStartWorkout: (routine: WorkoutRoutine) => void;
}

export const AllenamentoView: React.FC<AllenamentoViewProps> = ({ routines, history, onSaveRoutines, onStartWorkout }) => {
    const [tab, setTab] = useState<'schede' | 'storico'>('schede');
    const [isImportModalOpen, setImportModalOpen] = useState(false);

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
                    </div>
                </div>
            )}
            
            {tab === 'storico' && (
                <div>
                    {history.length > 0 ? [...history].reverse().map(session => (
                        <div className="card" key={session.id}>
                            <h4>{session.routineName}</h4>
                            <p className="routine-info">
                                {new Date(session.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                            <div className="session-duration">
                               <span className="material-symbols-outlined">timer</span>
                               <span>{formatDuration(session.duration)}</span>
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