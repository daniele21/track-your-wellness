import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { BodyMeasurement } from '../types/index';
import { formatDate } from '../utils/helpers';

interface AddMeasurementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (measurement: Omit<BodyMeasurement, 'date'>, date: string) => void;
    initialData: { measurement?: BodyMeasurement; date: string } | null;
}

export const AddMeasurementModal: React.FC<AddMeasurementModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [weight, setWeight] = useState('');
    const [bodyFat, setBodyFat] = useState('');
    const [muscleMass, setMuscleMass] = useState('');
    const [date, setDate] = useState(formatDate(new Date()));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && initialData) {
            setDate(initialData.date);
            setWeight(initialData.measurement?.weight?.toString() || '');
            setBodyFat(initialData.measurement?.bodyFat?.toString() || '');
            setMuscleMass(initialData.measurement?.muscleMass?.toString() || '');
            setError(null);
        }
    }, [isOpen, initialData]);

    const handleSubmit = () => {
        const weightValue = parseFloat(weight);
        if (isNaN(weightValue) || weightValue <= 0) {
            setError("Inserisci un peso valido.");
            return;
        }

        const bodyFatValue = bodyFat ? parseFloat(bodyFat) : undefined;
        if (bodyFat && (isNaN(bodyFatValue) || bodyFatValue < 0 || bodyFatValue > 100)) {
            setError("Inserisci una percentuale di grasso corporeo valida (0-100).");
            return;
        }
        
        const muscleMassValue = muscleMass ? parseFloat(muscleMass) : undefined;
        if (muscleMass && (isNaN(muscleMassValue) || muscleMassValue <= 0)) {
            setError("Inserisci una massa muscolare valida.");
            return;
        }

        onSave({ weight: weightValue, bodyFat: bodyFatValue, muscleMass: muscleMassValue }, date);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registra Misurazione">
            {error && <p className="error-message">{error}</p>}
             <div className="form-group">
                <label htmlFor="measurement-date">Data</label>
                <input
                    id="measurement-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={formatDate(new Date())} // Prevent future dates
                />
            </div>
            <div className="form-group">
                <label htmlFor="weight">Peso (kg)</label>
                <input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Es: 75.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label htmlFor="bodyFat">Grasso Corporeo (%) (Opzionale)</label>
                <input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    placeholder="Es: 15.2"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label htmlFor="muscleMass">Massa Muscolare (kg) (Opzionale)</label>
                <input
                    id="muscleMass"
                    type="number"
                    step="0.1"
                    placeholder="Es: 40.1"
                    value={muscleMass}
                    onChange={(e) => setMuscleMass(e.target.value)}
                />
            </div>
            <div className="modal-actions">
                <button className="btn-secondary" onClick={onClose}>Annulla</button>
                <button className="btn-primary" onClick={handleSubmit}>
                    Salva
                </button>
            </div>
        </Modal>
    );
};