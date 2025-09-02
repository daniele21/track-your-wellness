import React from 'react';
import { UserProfile } from './UserProfile';
import { AuthUser } from '../services/authService';

interface HeaderProps {
  title: string | React.ReactNode;
  actions?: React.ReactNode;
  onLogoClick?: () => void;
  user?: AuthUser;
}

export const Header: React.FC<HeaderProps> = ({ title, actions, onLogoClick, user }) => (
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
             {actions ? actions : (user ? <UserProfile user={user} /> : <div className="actions-placeholder"></div>)}
        </div>
    </header>
);