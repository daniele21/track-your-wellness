import React from 'react';

export const MacroBar: React.FC<{
    name: string;
    current: number;
    goal?: number;
    colorClass: 'carbs' | 'protein' | 'fats' | 'fiber';
}> = ({ name, current, goal = 1, colorClass }) => {
    const percentage = goal > 0 ? (current / goal) * 100 : 0;
    return (
        <div className="macro-item">
            <div className="info">
                <span className="name">{name}</span>
                <span className="value">{Math.round(current)} / {goal} g</span>
            </div>
            <div className="progress-bar">
                <div className={`progress-bar-fill ${colorClass}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
            </div>
        </div>
    );
};
