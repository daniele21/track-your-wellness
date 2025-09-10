import React, { useState, useMemo } from 'react';
import { WorkoutRoutine, WorkoutCategory, WORKOUT_CATEGORIES } from '../types/index';
import { PRESET_WORKOUTS } from '../types/presetWorkouts';

interface WorkoutLibraryProps {
    userRoutines: WorkoutRoutine[];
    onSelectRoutine: (routine: WorkoutRoutine) => void;
    onStartWorkout: (routine: WorkoutRoutine) => void;
    onEditRoutine?: (routine: WorkoutRoutine) => void;
    onDeleteRoutine?: (routineId: string) => void;
}

export const WorkoutLibrary: React.FC<WorkoutLibraryProps> = ({
    userRoutines,
    onSelectRoutine,
    onStartWorkout,
    onEditRoutine,
    onDeleteRoutine
}) => {
    const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory | 'tutti' | 'miei'>('tutti');
    const [searchTerm, setSearchTerm] = useState('');
    const [showPresets, setShowPresets] = useState(true);
    const [difficultyFilter, setDifficultyFilter] = useState<'tutti' | 'principiante' | 'intermedio' | 'avanzato'>('tutti');

    // Combine user routines with preset workouts
    const allRoutines = useMemo(() => {
        const routines = [...userRoutines];
        if (showPresets) {
            routines.push(...PRESET_WORKOUTS);
        }
        return routines;
    }, [userRoutines, showPresets]);

    // Filter routines based on selected criteria
    const filteredRoutines = useMemo(() => {
        return allRoutines.filter(routine => {
            // Category filter
            if (selectedCategory === 'miei' && routine.isPreset) return false;
            if (selectedCategory !== 'tutti' && selectedCategory !== 'miei' && routine.category !== selectedCategory) return false;
            
            // Difficulty filter
            if (difficultyFilter !== 'tutti' && routine.difficulty !== difficultyFilter) return false;
            
            // Search filter
            if (searchTerm && !routine.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
                !routine.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            
            return true;
        });
    }, [allRoutines, selectedCategory, searchTerm, difficultyFilter]);

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case 'principiante': return '#4caf50';
            case 'intermedio': return '#ff9800';
            case 'avanzato': return '#f44336';
            default: return '#757575';
        }
    };

    const getDifficultyIcon = (difficulty?: string) => {
        switch (difficulty) {
            case 'principiante': return 'star';
            case 'intermedio': return 'star_half';
            case 'avanzato': return 'stars';
            default: return 'help';
        }
    };

    return (
        <div className="workout-library">
            <div className="library-header">
                <h3>Libreria Allenamenti</h3>
            </div>

            {/* Search and Filters - All in one row */}
            <div className="library-filters-row">
                <div className="search-box">
                    <span className="material-symbols-outlined">search</span>
                    <input
                        type="text"
                        placeholder="Cerca allenamenti..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button 
                    className={`preset-toggle ${showPresets ? 'active' : ''}`}
                    onClick={() => setShowPresets(!showPresets)}
                >
                    <span className="material-symbols-outlined">
                        {showPresets ? 'library_books' : 'person'}
                    </span>
                    <span className="toggle-label">
                        {showPresets ? 'Tutti' : 'Miei'}
                    </span>
                </button>

                <div className="difficulty-filter">
                    <select 
                        value={difficultyFilter} 
                        onChange={(e) => setDifficultyFilter(e.target.value as any)}
                    >
                        <option value="tutti">Tutte le difficoltà</option>
                        <option value="principiante">Principiante</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzato">Avanzato</option>
                    </select>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="category-tabs">
                <button 
                    className={selectedCategory === 'tutti' ? 'active' : ''}
                    onClick={() => setSelectedCategory('tutti')}
                >
                    <span className="material-symbols-outlined">fitness_center</span>
                    <span className="tab-text">Tutti</span>
                </button>
                <button 
                    className={selectedCategory === 'miei' ? 'active' : ''}
                    onClick={() => setSelectedCategory('miei')}
                >
                    <span className="material-symbols-outlined">person</span>
                    <span className="tab-text">Miei</span>
                </button>
                {WORKOUT_CATEGORIES.map(category => {
                    // Create mobile-friendly shortened labels
                    const mobileLabel = category.value === 'bodybuilding' ? 'Body' :
                                      category.value === 'powerlifting' ? 'Power' :
                                      category.value === 'funzionale' ? 'Funz.' :
                                      category.value === 'crossfit' ? 'Cross' :
                                      category.label;
                    
                    return (
                        <button
                            key={category.value}
                            className={selectedCategory === category.value ? 'active' : ''}
                            onClick={() => setSelectedCategory(category.value)}
                        >
                            <span className="material-symbols-outlined">{category.icon}</span>
                            <span className="tab-text">{mobileLabel}</span>
                        </button>
                    );
                })}
            </div>

            {/* Routines Grid */}
            <div className="routines-grid">
                {filteredRoutines.length > 0 ? (
                    filteredRoutines.map(routine => (
                        <div key={routine.id} className={`routine-card ${routine.isPreset ? 'preset' : 'user'}`}>
                            <div className="routine-card-header">
                                <h4>{routine.name}</h4>
                                <div className="routine-badges">
                                    {routine.isPreset && (
                                        <span className="preset-badge">
                                            <span className="material-symbols-outlined">verified</span>
                                            Predefinito
                                        </span>
                                    )}
                                    {routine.difficulty && (
                                        <span 
                                            className="difficulty-badge"
                                            style={{ backgroundColor: getDifficultyColor(routine.difficulty) }}
                                        >
                                            <span className="material-symbols-outlined">
                                                {getDifficultyIcon(routine.difficulty)}
                                            </span>
                                            {routine.difficulty}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="routine-description">{routine.description}</p>

                            <div className="routine-meta">
                                <div className="meta-item">
                                    <span className="material-symbols-outlined">
                                        {WORKOUT_CATEGORIES.find(cat => cat.value === routine.category)?.icon || 'fitness_center'}
                                    </span>
                                    <span>{WORKOUT_CATEGORIES.find(cat => cat.value === routine.category)?.label || routine.category}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="material-symbols-outlined">exercise</span>
                                    <span>{routine.exercises.length} esercizi</span>
                                </div>
                                {routine.estimatedDuration && (
                                    <div className="meta-item">
                                        <span className="material-symbols-outlined">schedule</span>
                                        <span>~{routine.estimatedDuration} min</span>
                                    </div>
                                )}
                            </div>

                            <div className="routine-actions">
                                <button 
                                    className="btn-secondary"
                                    onClick={() => onSelectRoutine(routine)}
                                >
                                    <span className="material-symbols-outlined">visibility</span>
                                    Dettagli
                                </button>
                                <button 
                                    className="btn-primary"
                                    onClick={() => onStartWorkout(routine)}
                                >
                                    <span className="material-symbols-outlined">play_arrow</span>
                                    Inizia
                                </button>
                                {onEditRoutine && (
                                    <button 
                                        className="btn-edit"
                                        onClick={() => onEditRoutine(routine)}
                                        title={routine.isPreset ? "Crea copia per modificare" : "Modifica scheda"}
                                    >
                                        <span className="material-symbols-outlined">
                                            {routine.isPreset ? 'content_copy' : 'edit'}
                                        </span>
                                    </button>
                                )}
                                {!routine.isPreset && onDeleteRoutine && (
                                    <button 
                                        className="btn-danger-icon"
                                        onClick={() => onDeleteRoutine(routine.id)}
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <span className="material-symbols-outlined">search_off</span>
                        <h4>Nessun allenamento trovato</h4>
                        <p>Prova a cambiare i filtri o cerca con termini diversi</p>
                    </div>
                )}
            </div>
        </div>
    );
};
