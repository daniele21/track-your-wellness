import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { authService, AuthUser } from './services/authService';
import { LoginPage } from './components/LoginPage';

// Import your existing app component
import { App as WellnessApp } from './WellnessApp';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = authService.onAuthStateChange((authUser) => {
      setUser(authUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user || !authService.isAuthenticated()) {
    return <LoginPage onLoginSuccess={() => {/* Will be handled by auth state change */}} />;
  }

  // Show main app if authenticated
  return <WellnessApp user={user} />;
};

// Render the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root container not found');
}
