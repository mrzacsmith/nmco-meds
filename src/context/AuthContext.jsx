import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCJn1kwD72StdEuDX7iAsbPVh7r68ATjEE',
  authDomain: 'nmco-meds.firebaseapp.com',
  projectId: 'nmco-meds',
  storageBucket: 'nmco-meds.firebasestorage.app',
  messagingSenderId: '115607600008',
  appId: '1:115607600008:web:44236c3f5bafb51758983d',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Create the auth context
const AuthContext = createContext();

// Get user profile from Firestore
const getUserProfile = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return { data: userDoc.data(), error: null };
    } else {
      return { data: null, error: 'User profile not found' };
    }
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    // In a real app, this would make an API call to authenticate
    // For demo purposes, we'll simulate a successful login with mock data

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check credentials (very basic simulation)
    if (email && password) {
      const userData = {
        id: '123',
        email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'user',
      };

      // Save to state and localStorage
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid credentials'
    };
  };

  // Register function
  const register = async (userData) => {
    // In a real app, this would make an API call to register the user
    // For demo purposes, we'll simulate a successful registration

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (userData.email && userData.password) {
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        role: 'user',
      };

      // Save to state and localStorage
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid user data'
    };
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 