import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getFirestore,
  serverTimestamp
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { useDomain } from './DomainContext';

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
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const domain = useDomain();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Get user profile from Firestore
        const { data } = await getUserProfile(user.uid);
        setUserProfile(data);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const user = userCredential.user;

      // Set role as operator
      const role = 'operator';

      // Get state from domain
      const state = domain.state || 'NM';
      const stateCode = domain.stateCode || 'NM'; // Use stateCode from domain

      // Create user document FIRST
      const userDocRef = doc(db, 'users', user.uid);
      const userProfileData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: role,
        createdAt: serverTimestamp(),
        agreedToTerms: userData.agreeToTerms,
        isLegalAgent: userData.isLegalAgent || false,
        isBanned: false,
        accessibleStates: [stateCode], // Use stateCode instead of state
        businesses: [] // Initialize with empty array
      };

      // Save the initial user document
      await setDoc(userDocRef, userProfileData);

      // THEN create business document if user is registering as a business owner
      let businessRef = null;
      if (userData.businessName) {
        const businessData = {
          name: userData.businessName,
          state: state,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
          users: [{
            userId: user.uid,
            role: 'owner',
            permissions: ['read', 'write'],
            email: userData.email
          }]
        };

        // Add business to the appropriate collection based on state
        businessRef = await addDoc(
          collection(db, `businesses-${state.toLowerCase()}`),
          businessData
        );

        // Update user document with business reference
        if (businessRef) {
          await setDoc(userDocRef, {
            businesses: [{
              businessId: businessRef.id,
              role: 'owner',
              state: state
            }]
          }, { merge: true });

          // Update local user profile data
          userProfileData.businesses = [{
            businessId: businessRef.id,
            role: 'owner',
            state: state
          }];

          // Update platform stats
          try {
            const statsDocRef = doc(db, 'stats', 'platform-stats');
            const statsDoc = await getDoc(statsDocRef);

            if (statsDoc.exists()) {
              // Get current stats
              const statsData = statsDoc.data();

              // Update the appropriate state's stats
              const stateKey = state.toUpperCase();
              const currentLocations = (statsData[stateKey]?.locations || 0);
              const currentOperators = (statsData[stateKey]?.operators || 0);

              // Create update object
              const statsUpdate = {};
              statsUpdate[`${stateKey}.locations`] = currentLocations + 1;
              statsUpdate[`${stateKey}.operators`] = currentOperators + 1;

              // Update stats document
              await setDoc(statsDocRef, statsUpdate, { merge: true });
            } else {
              // Create new stats document if it doesn't exist
              const initialStats = {};
              initialStats[stateKey] = {
                locations: 1,
                operators: 1
              };
              await setDoc(statsDocRef, initialStats);
            }
          } catch (statsError) {
            console.error("Error updating platform stats:", statsError);
            // Continue with registration even if stats update fails
          }
        }
      }

      // Set user profile in state
      setUserProfile(userProfileData);

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { data, error } = await getUserProfile(userCredential.user.uid);

      if (error) {
        return { success: false, error };
      }

      setUserProfile(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return userProfile && userProfile.role === role;
  };

  // Check if user has access to a specific state
  const hasStateAccess = (state) => {
    if (!userProfile) return false;

    // Admins have access to all states
    if (userProfile.role === 'admin') return true;

    // Convert state name to state code if needed
    let stateCode = state;
    if (state === 'New Mexico') stateCode = 'NM';
    if (state === 'Colorado') stateCode = 'CO';

    // Check if user has access to the specified state code
    return userProfile.accessibleStates && userProfile.accessibleStates.includes(stateCode);
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    hasStateAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 