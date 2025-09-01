import React from 'react';

export const Header: React.FC<{ title: string | React.ReactNode; actions?: React.ReactNode; onLogoClick?: () => void; }> = ({ title, actions, onLogoClick }) => (
    <header className="header">
        <div className="header-logo">
            {onLogoClick ? (
                 <button onClick={onLogoClick} className="logo-btn" aria-label="Vai alla Home">
                    <span className="material-symbols-outlined">donut_large</span>
                </button>
            ) : (
                <div className="logo-placeholder"></div>
            )}
        </div>
        <div className="header-title-container">{typeof title === 'string' ? <h1 className="view-title">{title}</h1> : title}</div>
        <div className="header-actions">
             {actions ? actions : <div className="actions-placeholder"></div>}
        </div>
    </header>
);