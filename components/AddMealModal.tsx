import React, { useState } from 'react';
import { Modal } from './Modal';
import { analyzeMealWithGemini } from '../services/geminiService';
import { FoodItem, MealType, MEAL_TYPES } from '../types/index';

export const AddMealModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddMeal: (mealType: MealType, items: FoodItem[]) => void;
}> = ({ isOpen, onClose, onAddMeal }) => {
    const [mealType, setMealType] = useState<MealType>('Pranzo');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!description.trim()) {
            setError("La descrizione non può essere vuota.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const foodItems = await analyzeMealWithGemini(description);
            onAddMeal(mealType, foodItems);
            setDescription('');
            onClose();
        } catch (e: any) {
            console.error("Error analyzing meal:", e);
            setError(e.message || "Si è verificato un errore.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Aggiungi Pasto con AI">
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
                <label htmlFor="meal-type">Tipo di Pasto</label>
                <select id="meal-type" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
                    {MEAL_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="meal-description">Descrivi cosa hai mangiato</label>
                <textarea
                    id="meal-description"
                    rows={5}
                    placeholder="Es: 100g di pasta al pomodoro, una mela e 30g di parmigiano"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div className="modal-actions">
                <button className="btn-secondary" onClick={onClose}>Annulla</button>
                <button className="btn-primary" onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? 'Analizzando...' : 'Aggiungi'}
                </button>
            </div>
        </Modal>
    );
};
