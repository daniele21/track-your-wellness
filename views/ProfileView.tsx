import React, { useState } from 'react';
// Import MEAL_TYPES to iterate over daily logs safely.
import { DailyLog, NutritionGoals, Theme, FoodItem, MEAL_TYPES } from '../types/index';
import { generateShoppingListWithGemini } from '../services/geminiService';

interface ProfileViewProps {
    goals: NutritionGoals;
    onUpdateGoals: (newGoals: NutritionGoals) => void;
    dailyLog: DailyLog | null;
    theme: Theme;
    onSetTheme: (theme: Theme) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ goals, onUpdateGoals, dailyLog, theme, onSetTheme }) => {
    const [localGoals, setLocalGoals] = useState(goals);
    const [isGeneratingList, setIsGeneratingList] = useState(false);
    const [shoppingList, setShoppingList] = useState('');
    
    const handleGoalChange = (key: keyof NutritionGoals, field: 'value' | 'enabled', value: number | boolean) => {
        setLocalGoals(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };
    
    const handleSave = () => {
        onUpdateGoals(localGoals);
        alert("Obiettivi salvati!");
    };
    
    const handleGenerateShoppingList = async () => {
        // Replaced a problematic loop over Object.values() with a safer iteration
        // over known meal types to avoid type errors.
        const allItems: FoodItem[] = [];
        if (dailyLog) {
            for (const mealType of MEAL_TYPES) {
                const meal = dailyLog[mealType];
                if (meal) {
                    allItems.push(...meal);
                }
            }
        }

        if (allItems.length === 0) {
            alert("Nessun alimento registrato oggi per generare la lista.");
            return;
        }
        setIsGeneratingList(true);
        setShoppingList('');
        try {
            const list = await generateShoppingListWithGemini(allItems);
            setShoppingList(list);
        } catch (error: any) {
            console.error("Failed to generate shopping list:", error);
            alert(error.message);
        } finally {
            setIsGeneratingList(false);
        }
    };
    
    return (
        <div className="profile-view">
            <div className="card">
                <h3>Aspetto</h3>
                <div className="goal-input-group">
                    <label htmlFor="dark-mode-toggle">Tema Scuro</label>
                    <div className="input-wrapper">
                         <label className="toggle-switch">
                            <input
                                type="checkbox"
                                id="dark-mode-toggle"
                                checked={theme === 'dark'}
                                onChange={e => onSetTheme(e.target.checked ? 'dark' : 'light')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
            <div className="card">
                <h3>Obiettivi Nutrizionali</h3>
                <div className="goals-editor">
                    {(Object.keys(localGoals) as Array<keyof NutritionGoals>).filter(key => key !== 'weeklyWorkouts').map(key => (
                        <div key={key} className={`goal-input-group ${!localGoals[key].enabled ? 'disabled' : ''}`}>
                            <label htmlFor={`goal-${key}`}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                            <div className="input-wrapper">
                                <input
                                    id={`goal-${key}`}
                                    type="number"
                                    value={localGoals[key].value}
                                    onChange={e => handleGoalChange(key, 'value', parseInt(e.target.value) || 0)}
                                    disabled={!localGoals[key].enabled}
                                />
                                <span>{key === 'kcal' ? 'kcal' : 'g'}</span>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={localGoals[key].enabled}
                                        onChange={e => handleGoalChange(key, 'enabled', e.target.checked)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="card">
                <h3>Obiettivi Allenamento</h3>
                <div className="goals-editor">
                    <div className={`goal-input-group ${!localGoals.weeklyWorkouts?.enabled ? 'disabled' : ''}`}>
                        <label htmlFor={`goal-weeklyWorkouts`}>Allenamenti a settimana</label>
                        <div className="input-wrapper">
                            <input
                                id={`goal-weeklyWorkouts`}
                                type="number"
                                value={localGoals.weeklyWorkouts?.value ?? 0}
                                onChange={e => handleGoalChange('weeklyWorkouts', 'value', parseInt(e.target.value) || 0)}
                                disabled={!localGoals.weeklyWorkouts?.enabled}
                            />
                            <span>volte</span>
                             <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={localGoals.weeklyWorkouts?.enabled ?? false}
                                    onChange={e => handleGoalChange('weeklyWorkouts', 'enabled', e.target.checked)}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
             <div className="page-actions-container" style={{padding: '0 8px 16px'}}>
                <button className="btn-primary" onClick={handleSave}>Salva Obiettivi</button>
            </div>
             <div className="card">
                <h3>Funzioni AI</h3>
                <div className="page-actions-container">
                    <button className="btn-secondary" onClick={handleGenerateShoppingList} disabled={isGeneratingList}>
                        {isGeneratingList ? "Generando..." : "Crea Lista Spesa di Oggi"}
                    </button>
                </div>
                 {shoppingList && (
                    <div className="form-group" style={{marginTop: '16px'}}>
                        <label>Lista della Spesa Generata:</label>
                        <textarea rows={10} value={shoppingList} readOnly />
                    </div>
                 )}
            </div>
        </div>
    );
};