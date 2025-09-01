import React, { useState } from 'react';
import { Modal } from './Modal';
import { analyzeRoutinesWithGemini } from '../services/geminiService';
import { WorkoutRoutine } from '../types/index';

export const RoutineImportModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onImport: (routines: Omit<WorkoutRoutine, 'id'>[]) => void;
}> = ({ isOpen, onClose, onImport }) => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!text.trim()) {
            setError("Il testo non può essere vuoto.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const routines = await analyzeRoutinesWithGemini(text);
            onImport(routines);
            setText('');
            onClose();
        } catch (e: any) {
            console.error("Error importing routines:", e);
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Importa Schede con AI">
             {error && <p className="error-message">{error}</p>}
            <div className="form-group">
                <label htmlFor="routine-text">Incolla qui le tue schede di allenamento</label>
                 <textarea
                    id="routine-text"
                    rows={10}
                    placeholder="Es: Giorno A - Spinta\nPanca piana 4x8-12\nSpinte manubri inclinata 3x10\n..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>
            <div className="modal-actions">
                <button className="btn-secondary" onClick={onClose}>Annulla</button>
                <button className="btn-primary" onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? 'Importando...' : 'Importa'}
                </button>
            </div>
        </Modal>
    );
};
