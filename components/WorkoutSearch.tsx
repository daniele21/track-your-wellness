import React, { useState, useMemo } from 'react';
import { WorkoutSession } from '../types/index';
import { formatDuration } from '../types/utils/helpers';

interface WorkoutSearchProps {
    workoutSessions: WorkoutSession[];
    onSessionSelect: (session: WorkoutSession) => void;
    onEditSession: (session: WorkoutSession) => void;
    onDeleteSession: (sessionId: string) => void;
}

export const WorkoutSearch: React.FC<WorkoutSearchProps> = ({ 
    workoutSessions, 
    onSessionSelect, 
    onEditSession, 
    onDeleteSession 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'duration' | 'routine'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const filteredAndSortedSessions = useMemo(() => {
        let filtered = workoutSessions.filter(session => {
            const matchesSearch = searchTerm === '' || 
                session.routineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                session.exercises.some(ex => 
                    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ex.notes.toLowerCase().includes(searchTerm.toLowerCase())
                ) ||
                (session.sessionNotes && session.sessionNotes.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesDate = dateFilter === '' || session.date.includes(dateFilter);
            
            return matchesSearch && matchesDate;
        });

        // Sort the filtered results
        filtered.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'date':
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                    break;
                case 'duration':
                    comparison = a.duration - b.duration;
                    break;
                case 'routine':
                    comparison = a.routineName.localeCompare(b.routineName);
                    break;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [workoutSessions, searchTerm, dateFilter, sortBy, sortOrder]);

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const clearFilters = () => {
        setSearchTerm('');
        setDateFilter('');
        setSortBy('date');
        setSortOrder('desc');
    };

    const getCompletedExerciseCount = (session: WorkoutSession) => {
        return session.exercises.filter(ex => ex.completed).length;
    };

    const getTotalExerciseCount = (session: WorkoutSession) => {
        return session.exercises.length;
    };

    return (
        <div className="workout-search">
            <div className="search-filters">
                <div className="search-input-group">
                    <div className="search-input-wrapper">
                        <span className="material-symbols-outlined search-icon">search</span>
                        <input
                            type="text"
                            placeholder="Cerca per nome routine, esercizio o note..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button 
                                className="clear-search-btn"
                                onClick={() => setSearchTerm('')}
                                aria-label="Cancella ricerca"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="filter-controls">
                    <div className="date-filter">
                        <label htmlFor="date-filter">Filtra per periodo:</label>
                        <input
                            id="date-filter"
                            type="month"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                    
                    <div className="sort-controls">
                        <label htmlFor="sort-by">Ordina per:</label>
                        <select
                            id="sort-by"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'date' | 'duration' | 'routine')}
                        >
                            <option value="date">Data</option>
                            <option value="duration">Durata</option>
                            <option value="routine">Nome Routine</option>
                        </select>
                        <button 
                            className="sort-order-btn"
                            onClick={toggleSortOrder}
                            aria-label={`Ordine ${sortOrder === 'asc' ? 'crescente' : 'decrescente'}`}
                        >
                            <span className="material-symbols-outlined">
                                {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                            </span>
                        </button>
                    </div>
                    
                    <button className="clear-filters-btn" onClick={clearFilters}>
                        <span className="material-symbols-outlined">clear_all</span>
                        Reset
                    </button>
                </div>
            </div>
            
            <div className="search-results">
                <div className="results-header">
                    <span>{filteredAndSortedSessions.length} allenament{filteredAndSortedSessions.length === 1 ? 'o' : 'i'} trovat{filteredAndSortedSessions.length === 1 ? 'o' : 'i'}</span>
                </div>
                
                {filteredAndSortedSessions.length === 0 ? (
                    <div className="no-results">
                        <span className="material-symbols-outlined">search_off</span>
                        <h4>Nessun allenamento trovato</h4>
                        <p>Prova a modificare i filtri di ricerca.</p>
                    </div>
                ) : (
                    <div className="workout-sessions-list">
                        {filteredAndSortedSessions.map(session => (
                            <div 
                                key={session.id} 
                                className="workout-session-card"
                                onClick={() => onSessionSelect(session)}
                            >
                                <div className="session-main-info">
                                    <div className="session-header">
                                        <h4>{session.routineName}</h4>
                                        <span className="session-date">
                                            {new Date(session.date).toLocaleDateString('it-IT', { 
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </span>
                                    </div>
                                    
                                    <div className="session-stats">
                                        <div className="stat-item">
                                            <span className="material-symbols-outlined">timer</span>
                                            <span>{formatDuration(session.duration)}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="material-symbols-outlined">fitness_center</span>
                                            <span>{getCompletedExerciseCount(session)}/{getTotalExerciseCount(session)} esercizi</span>
                                        </div>
                                    </div>
                                    
                                    {session.sessionNotes && (
                                        <div className="session-notes-preview">
                                            <span className="material-symbols-outlined">note</span>
                                            <span>{session.sessionNotes.substring(0, 100)}{session.sessionNotes.length > 100 ? '...' : ''}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="session-actions">
                                    <button 
                                        className="btn-secondary-icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditSession(session);
                                        }}
                                        aria-label={`Modifica sessione ${session.routineName}`}
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    <button 
                                        className="btn-danger-icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Sei sicuro di voler eliminare questa sessione?')) {
                                                onDeleteSession(session.id);
                                            }
                                        }}
                                        aria-label={`Elimina sessione ${session.routineName}`}
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
