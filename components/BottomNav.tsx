import React from 'react';
import { View } from '../types/index';

export const BottomNav: React.FC<{ activeView: View; setView: (view: View) => void }> = ({ activeView, setView }) => {
    const navItems: { view: View; label: string; icon: string }[] = [
        { view: 'pasti', label: 'Pasti', icon: 'restaurant_menu' },
        { view: 'allenamento', label: 'Workout', icon: 'fitness_center' },
        { view: 'misure', label: 'Misure', icon: 'straighten' },
        { view: 'analisi', label: 'Analisi', icon: 'bar_chart' },
        { view: 'profile', label: 'Profilo', icon: 'person' },
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <button
                    key={item.view}
                    className={`nav-item ${activeView === item.view ? 'active' : ''}`}
                    onClick={() => setView(item.view)}
                    aria-label={item.label}
                    aria-current={activeView === item.view ? 'page' : undefined}
                >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="label">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};