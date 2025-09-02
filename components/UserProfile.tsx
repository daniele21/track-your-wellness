import React, { useState } from 'react';
import { authService, AuthUser } from '../services/authService';

interface UserProfileProps {
  user: AuthUser;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await authService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
      setShowDropdown(false);
    }
  };

  return (
    <div className="user-profile-container">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="user-profile-button"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="user-profile-avatar"
          />
        ) : (
          <div className="user-profile-avatar-placeholder">
            {(user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>
        )}
        <span className="user-profile-name">
          {user.displayName || user.email?.split('@')[0] || 'User'}
        </span>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
          {showDropdown ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setShowDropdown(false)}
          />
          {/* Dropdown */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              zIndex: 1000,
              minWidth: '200px',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                {user.displayName || 'User'}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {user.email}
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                fontSize: '14px',
                color: isLoggingOut ? '#9ca3af' : '#dc2626',
                cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!isLoggingOut) {
                  e.currentTarget.style.background = '#fef2f2';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {isLoggingOut ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #d1d5db',
                      borderTop: '2px solid #dc2626',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                  Signing out...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16,17 21,12 16,7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign out
                </>
              )}
            </button>
          </div>
        </>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
