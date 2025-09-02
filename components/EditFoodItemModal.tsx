import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FoodItem } from '../types/index';

interface EditFoodItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: FoodItem) => void;
    foodItem: FoodItem | null;
}

export const EditFoodItemModal: React.FC<EditFoodItemModalProps> = ({ isOpen, onClose, onSave, foodItem }) => {
    const [item, setItem] = useState<FoodItem | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        if (foodItem) {
            setItem({ ...foodItem });
        }
    }, [foodItem, isOpen]);

    const handleChange = (field: keyof FoodItem, value: string) => {
        if (!item) return;

        const isNumericField = field !== 'name';
        const numericValue = isNumericField ? parseFloat(value) : 0;

        if (isNumericField && (isNaN(numericValue) || numericValue < 0)) {
            // allow empty input for typing, but don't update state with NaN
            if (value === '') {
                 setItem(prev => prev ? { ...prev, [field]: '' } as any : null);
            }
            return;
        }

        setItem(prev => prev ? { ...prev, [field]: isNumericField ? numericValue : value } : null);
    };

    const handleSubmit = () => {
        if (!item || !item.name.trim()) {
            setError("Il nome non può essere vuoto.");
            return;
        }
        
        const validatedItem: FoodItem = {
            name: item.name,
            kcal: Number(item.kcal) || 0,
            carbs: Number(item.carbs) || 0,
            protein: Number(item.protein) || 0,
            fats: Number(item.fats) || 0,
            fiber: Number(item.fiber) || 0,
        };

        onSave(validatedItem);
        onClose();
    };
    
    if (!item) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Modifica Alimento">
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
                <label htmlFor="food-name">Nome Alimento</label>
                <input
                    id="food-name"
                    type="text"
                    value={item.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                />
            </div>
            <div className="edit-food-grid">
                <div className="form-group">
                    <label htmlFor="food-kcal">Calorie (kcal)</label>
                    <input id="food-kcal" type="number" value={item.kcal} onChange={(e) => handleChange('kcal', e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="food-protein">Proteine (g)</label>
                    <input id="food-protein" type="number" value={item.protein} onChange={(e) => handleChange('protein', e.target.value)} />
                </div>
                 <div className="form-group">
                    <label htmlFor="food-carbs">Carboidrati (g)</label>
                    <input id="food-carbs" type="number" value={item.carbs} onChange={(e) => handleChange('carbs', e.target.value)} />
                </div>
                 <div className="form-group">
                    <label htmlFor="food-fats">Grassi (g)</label>
                    <input id="food-fats" type="number" value={item.fats} onChange={(e) => handleChange('fats', e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="food-fiber">Fibre (g)</label>
                    <input id="food-fiber" type="number" value={item.fiber} onChange={(e) => handleChange('fiber', e.target.value)} />
                </div>
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