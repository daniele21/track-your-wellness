// Authentication service for managing user login/logout
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  AuthError
} from 'firebase/auth';
import { auth, googleProvider } from './firebaseConfig';

// List of allowed email addresses (add your email and any others you want to allow)
const ALLOWED_USERS = [
  'danielemoltisanti@gmail.com', // Your email
  // Add more allowed emails here:
  // 'friend@example.com',
  // 'family@example.com'
];

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      const authUser = user ? this.formatUser(user) : null;
      
      // Notify all listeners
      this.authStateListeners.forEach(listener => listener(authUser));
    });
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user email is in the allowed list
      if (!user.email || !ALLOWED_USERS.includes(user.email)) {
        // Sign out the unauthorized user
        await this.signOut();
        return {
          success: false,
          error: `Access denied. Your email (${user.email}) is not authorized to use this app.`
        };
      }

      console.log('User signed in successfully:', user.email);
      return {
        success: true,
        user: this.formatUser(user)
      };
    } catch (error) {
      const authError = error as AuthError;
      console.error('Sign in error:', authError);
      
      let errorMessage = 'Failed to sign in with Google';
      if (authError.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled';
      } else if (authError.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser. Please allow popups for this site.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser ? this.formatUser(this.currentUser) : null;
  }

  // Check if user is authenticated and authorized
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.isAuthorized();
  }

  // Check if current user is in the allowed list
  isAuthorized(): boolean {
    const email = this.currentUser?.email;
    return email ? ALLOWED_USERS.includes(email) : false;
  }

  // Listen for authentication state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Call immediately with current state
    const currentUser = this.getCurrentUser();
    callback(currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Get auth token for API calls
  async getAuthToken(): Promise<string | null> {
    if (!this.currentUser) return null;
    try {
      return await this.currentUser.getIdToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Format Firebase User for our app
  private formatUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
