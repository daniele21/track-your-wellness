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
                    <svg width="28" height="28" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M96 28h64l64 44v88l-64 44H96L32 160V72L96 28Z"
                              stroke="currentColor" strokeWidth="16" strokeLinejoin="round" fill="none"/>
                        <path d="M60 130 H90 L106 94 L118 146 L132 118 L142 130 H164"
                              stroke="currentColor" strokeWidth="12" strokeLinecap="round" fill="none"/>
                        <rect x="168" y="110" width="12" height="40" rx="3" fill="currentColor"/>
                        <rect x="184" y="100" width="12" height="50" rx="3" fill="currentColor" opacity="0.85"/>
                        <rect x="200" y="88"  width="12" height="62" rx="3" fill="currentColor" opacity="0.70"/>
                    </svg>
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