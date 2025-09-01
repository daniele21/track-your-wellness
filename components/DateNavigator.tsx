import React from 'react';
import { formatDate, getDisplayDate } from '../utils/helpers';

export const DateNavigator: React.FC<{ currentDate: Date; setCurrentDate: (date: Date) => void; }> = ({ currentDate, setCurrentDate }) => {
    const isToday = formatDate(currentDate) === formatDate(new Date());

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + days);
        setCurrentDate(newDate);
    };

    return (
        <div className="date-nav">
            <button onClick={() => changeDate(-1)} aria-label="Giorno precedente">
                <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span>{getDisplayDate(currentDate)}</span>
            <button onClick={() => changeDate(1)} disabled={isToday} aria-label="Giorno successivo">
                <span className="material-symbols-outlined">chevron_right</span>
            </button>
        </div>
    );
};
