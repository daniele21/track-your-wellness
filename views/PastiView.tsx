import React from 'react';
import { DailyLog, MealType, MEAL_TYPES } from '../types/index';

interface PastiViewProps {
    dailyLog: DailyLog | null;
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    onAddMealClick: () => void;
    onDeleteFood: (mealType: MealType, itemIndex: number) => void;
    onEditFood: (mealType: MealType, itemIndex: number) => void;
}

export const PastiView: React.FC<PastiViewProps> = ({ dailyLog, currentDate, setCurrentDate, onAddMealClick, onDeleteFood, onEditFood }) => {

    return (
        <>
            {MEAL_TYPES.map(mealType => {
                const mealItems = dailyLog?.[mealType] ?? [];
                const mealKcal = mealItems.reduce((sum, item) => sum + item.kcal, 0);

                return (
                    <div className="card" key={mealType}>
                        <div className="meal-header">
                            <h3>{mealType}</h3>
                            <span className="calories">{Math.round(mealKcal)} kcal</span>
                        </div>
                        {mealItems.length > 0 ? (
                            <ul className="food-list">
                                {mealItems.map((item, index) => (
                                    <li key={index} className="food-item">
                                        <span className="name">{item.name}</span>
                                        <div className="food-item-actions">
                                            <span className="kcal">{Math.round(item.kcal)} kcal</span>
                                             <button onClick={() => onEditFood(mealType, index)} className="btn-secondary-icon" aria-label={`Modifica ${item.name}`}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                            </button>
                                             <button onClick={() => onDeleteFood(mealType, index)} className="btn-danger-icon" aria-label={`Rimuovi ${item.name}`}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-meal">Nessun alimento aggiunto.</p>
                        )}
                    </div>
                );
            })}
            <button className="fab" onClick={onAddMealClick} aria-label="Aggiungi pasto">
                <span className="material-symbols-outlined">add</span>
            </button>
        </>
    );
};