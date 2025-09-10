import React, { useState } from 'react';
import { WorkoutSession } from '../types/index';

interface WorkoutCalendarProps {
    workoutSessions: WorkoutSession[];
    onDateSelect: (date: string) => void;
}

export const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ workoutSessions, onDateSelect }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const formatDate = (year: number, month: number, day: number) => {
        const date = new Date(year, month, day);
        return date.toISOString().split('T')[0];
    };

    const hasWorkout = (dateString: string) => {
        return workoutSessions.some(session => session.date === dateString);
    };

    const getWorkoutCount = (dateString: string) => {
        return workoutSessions.filter(session => session.date === dateString).length;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const monthNames = [
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const today = new Date().toISOString().split('T')[0];

    const renderCalendarDays = () => {
        const days = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }
        
        // Add actual days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = formatDate(year, month, day);
            const isToday = dateString === today;
            const hasWorkoutSession = hasWorkout(dateString);
            const workoutCount = getWorkoutCount(dateString);
            
            days.push(
                <div
                    key={day}
                    className={`calendar-day ${isToday ? 'today' : ''} ${hasWorkoutSession ? 'has-workout' : ''}`}
                    onClick={() => onDateSelect(dateString)}
                >
                    <span className="day-number">{day}</span>
                    {hasWorkoutSession && (
                        <div className="workout-indicator">
                            <span className="workout-count">{workoutCount}</span>
                        </div>
                    )}
                </div>
            );
        }
        
        return days;
    };

    return (
        <div className="workout-calendar">
            <div className="calendar-header">
                <button className="nav-btn" onClick={() => navigateMonth('prev')}>
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <h3>{monthNames[month]} {year}</h3>
                <button className="nav-btn" onClick={() => navigateMonth('next')}>
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
            
            <div className="calendar-weekdays">
                {dayNames.map(day => (
                    <div key={day} className="weekday-label">{day}</div>
                ))}
            </div>
            
            <div className="calendar-grid">
                {renderCalendarDays()}
            </div>
            
            <div className="calendar-legend">
                <div className="legend-item">
                    <div className="legend-dot has-workout"></div>
                    <span>Giorni con allenamento</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot today"></div>
                    <span>Oggi</span>
                </div>
            </div>
        </div>
    );
};
