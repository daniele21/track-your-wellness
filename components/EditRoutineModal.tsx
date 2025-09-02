import React, { useState } from 'react';
import { Modal } from './Modal';
import { WorkoutRoutine, ExerciseDefinition } from '../types/index';
import { generateUniqueId } from '../types/utils/helpers';

interface EditRoutineModalProps {
  isOpen: boolean;
  routine: WorkoutRoutine | null;
  onClose: () => void;
  onSave: (routine: WorkoutRoutine) => void;
}

export const EditRoutineModal: React.FC<EditRoutineModalProps> = ({ isOpen, routine, onClose, onSave }) => {
  const [localRoutine, setLocalRoutine] = useState<WorkoutRoutine | null>(routine);

  React.useEffect(() => {
    setLocalRoutine(routine);
  }, [routine]);

  if (!localRoutine) return null;

  const handleChange = (field: keyof WorkoutRoutine, value: any) => {
    setLocalRoutine({ ...localRoutine, [field]: value });
  };

  const handleExerciseChange = (exerciseIndex: number, field: keyof ExerciseDefinition, value: any) => {
    const updatedExercises = [...localRoutine.exercises];
    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      [field]: value
    };
    setLocalRoutine({ ...localRoutine, exercises: updatedExercises });
  };

  const handleAddExercise = () => {
    const newExercise: ExerciseDefinition = {
      id: generateUniqueId(),
      name: '',
      sets: 3,
      reps: '8-12',
      notes: ''
    };
    setLocalRoutine({ 
      ...localRoutine, 
      exercises: [...localRoutine.exercises, newExercise] 
    });
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    const updatedExercises = localRoutine.exercises.filter((_, index) => index !== exerciseIndex);
    setLocalRoutine({ ...localRoutine, exercises: updatedExercises });
  };

  const handleSave = () => {
    if (localRoutine) onSave(localRoutine);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifica Scheda">
      <div className="modal-section">
        <div className="form-group">
          <label>Nome Scheda</label>
          <input 
            type="text" 
            value={localRoutine.name} 
            onChange={e => handleChange('name', e.target.value)}
            className="exercise-edit-input"
            placeholder="Es. Push Day, Upper Body..."
          />
        </div>
        <div className="form-group">
          <label>Descrizione</label>
          <textarea 
            value={localRoutine.description || ''} 
            onChange={e => handleChange('description', e.target.value)}
            className="exercise-edit-textarea"
            placeholder="Descrizione della scheda di allenamento..."
            rows={2}
          />
        </div>
      </div>
      
      <div className="modal-section">
        <div className="modal-section-header">
          <h3 className="modal-section-title">Esercizi ({localRoutine.exercises.length})</h3>
          <button type="button" className="btn-primary" onClick={handleAddExercise}>
            <span className="material-symbols-outlined">add</span>
            Aggiungi Esercizio
          </button>
        </div>
        
        {localRoutine.exercises.length > 0 ? (
          localRoutine.exercises.map((exercise, index) => (
            <div key={exercise.id} className="exercise-edit-card">
              <div className="exercise-edit-header">
                <h4>Esercizio {index + 1}</h4>
                <button 
                  type="button" 
                  className="btn-danger-icon" 
                  onClick={() => handleRemoveExercise(index)}
                  aria-label={`Rimuovi esercizio ${index + 1}`}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
              
              <div className="exercise-edit-form-group">
                <label>Nome Esercizio</label>
                <input 
                  type="text" 
                  value={exercise.name} 
                  onChange={e => handleExerciseChange(index, 'name', e.target.value)}
                  placeholder="Es. Panca piana, Squat, Trazioni..."
                  className="exercise-edit-input"
                />
              </div>
              
              <div className="exercise-edit-grid">
                <div className="exercise-edit-form-group">
                  <label>Serie</label>
                  <input 
                    type="number" 
                    value={exercise.sets} 
                    onChange={e => handleExerciseChange(index, 'sets', parseInt(e.target.value) || 0)}
                    min="1"
                    max="10"
                    className="exercise-edit-input"
                  />
                </div>
                
                <div className="exercise-edit-form-group">
                  <label>Ripetizioni</label>
                  <input 
                    type="text" 
                    value={exercise.reps} 
                    onChange={e => handleExerciseChange(index, 'reps', e.target.value)}
                    placeholder="Es. 8-12, 15, 30 sec, 1 min"
                    className="exercise-edit-input"
                  />
                </div>
              </div>
              
              <div className="exercise-edit-form-group">
                <label>Note</label>
                <textarea 
                  value={exercise.notes} 
                  onChange={e => handleExerciseChange(index, 'notes', e.target.value)}
                  placeholder="Note tecniche, consigli per l'esecuzione, varianti..."
                  className="exercise-edit-textarea"
                  rows={2}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="add-exercise-section">
            <div className="empty-exercises-state">
              <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3, marginBottom: '12px', display: 'block' }}>
                fitness_center
              </span>
              <p>Nessun esercizio nella scheda</p>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Clicca "Aggiungi Esercizio" per iniziare a costruire la tua scheda
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Annulla</button>
        <button className="btn-primary" onClick={handleSave}>
          <span className="material-symbols-outlined">save</span>
          Salva Modifiche
        </button>
      </div>
    </Modal>
  );
};
