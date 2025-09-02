import React from 'react';

export const CalorieRing: React.FC<{ current: number; goal?: number }> = ({ current, goal = 0 }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = goal > 0 ? circumference - (Math.min(current, goal) / goal) * circumference : circumference;

    return (
        <div className="calorie-ring">
            <svg>
                <defs>
                    <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                    </linearGradient>
                    <filter id="glowEffect">
                        <feGaussianBlur stdDeviation="2" result="glow"/>
                        <feMerge>
                            <feMergeNode in="glow"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <circle className="calorie-ring-bg" cx="60" cy="60" r={radius} />
                <circle 
                    className="calorie-ring-fg" 
                    cx="60" 
                    cy="60" 
                    r={radius} 
                    strokeDasharray={circumference} 
                    strokeDashoffset={offset}
                    filter="url(#glowEffect)"
                />
            </svg>
            <div className="calorie-text">
                <span className="value">{Math.round(current)}</span>
                <span className="label">/{goal > 0 ? goal : '---'} kcal</span>
            </div>
        </div>
    );
};
