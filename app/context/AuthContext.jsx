import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, getUserProfile } from '~/lib/firebase';

// Create the auth context
const AuthContext = createContext(null);

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (authUser) => {
      setLoading(true);
      try {
        if (authUser) {
          // User is signed in
          setUser(authUser);

          // Get user profile from Firestore
          const { data, error } = await getUserProfile(authUser.uid);
          if (error) {
            setError(error);
          } else {
            setUserProfile(data);
          }
        } else {
          // User is signed out
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Check if user is admin
  const isAdmin = userProfile?.role === 'admin';

  // Check if user has businesses in a specific state
  const hasBusinessesInState = (state) => {
    if (!userProfile || !userProfile.businessIds) return false;

    const stateKey = state.toLowerCase();
    return userProfile.businessIds[stateKey] && userProfile.businessIds[stateKey].length > 0;
  };

  // Value to be provided to consumers
  const value = {
    user,
    userProfile,
    loading,
    error,
    isAdmin,
    hasBusinessesInState,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 