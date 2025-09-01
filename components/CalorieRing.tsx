import React from 'react';

export const CalorieRing: React.FC<{ current: number; goal?: number }> = ({ current, goal = 0 }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = goal > 0 ? circumference - (Math.min(current, goal) / goal) * circumference : circumference;

    return (
        <div className="calorie-ring">
            <svg>
                <circle className="calorie-ring-bg" cx="50" cy="50" r={radius} />
                <circle className="calorie-ring-fg" cx="50" cy="50" r={radius} strokeDasharray={circumference} strokeDashoffset={offset} />
            </svg>
            <div className="calorie-text">
                <span className="value">{Math.round(current)}</span>
                <span className="label">/{goal} kcal</span>
            </div>
        </div>
    );
};
