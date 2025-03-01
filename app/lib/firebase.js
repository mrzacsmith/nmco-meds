// Firebase configuration and utilities
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore'

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
let app
let auth
let db

// Initialize Firebase only in browser environment
if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
}

// Authentication functions
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    await updateLastLogin(userCredential.user.uid)
    return { user: userCredential.user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

export const registerWithEmail = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create user document in Firestore
    await createUserProfile(user.uid, {
      email: user.email,
      displayName: userData.displayName || '',
      role: 'operator', // Default role
      states: userData.states || [],
      businessIds: { co: [], nm: [] },
      companyName: userData.companyName || '',
      phone: userData.phone || '',
      isMultiState: userData.isMultiState || false,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
    })

    return { user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const user = userCredential.user

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))

    if (!userDoc.exists()) {
      // Create new user profile if first time login
      await createUserProfile(user.uid, {
        email: user.email,
        displayName: user.displayName || '',
        role: 'operator', // Default role
        states: [],
        businessIds: { co: [], nm: [] },
        companyName: '',
        phone: '',
        isMultiState: false,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
      })
    } else {
      // Update last login
      await updateLastLogin(user.uid)
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Firestore functions
export const createUserProfile = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), userData)
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      return { data: userDoc.data(), error: null }
    } else {
      return { data: null, error: 'User not found' }
    }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const updateLastLogin = async (userId) => {
  try {
    await setDoc(doc(db, 'users', userId), { lastLogin: Timestamp.now() }, { merge: true })
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Get businesses for a user
export const getUserBusinesses = async (userId) => {
  try {
    const { data: userData, error } = await getUserProfile(userId)
    if (error) return { businesses: [], error }

    const businesses = {
      co: [],
      nm: [],
    }

    // Get CO businesses
    if (userData.businessIds.co && userData.businessIds.co.length > 0) {
      for (const businessId of userData.businessIds.co) {
        const businessDoc = await getDoc(doc(db, 'businesses-co', businessId))
        if (businessDoc.exists()) {
          businesses.co.push({ id: businessDoc.id, ...businessDoc.data() })
        }
      }
    }

    // Get NM businesses
    if (userData.businessIds.nm && userData.businessIds.nm.length > 0) {
      for (const businessId of userData.businessIds.nm) {
        const businessDoc = await getDoc(doc(db, 'businesses-nm', businessId))
        if (businessDoc.exists()) {
          businesses.nm.push({ id: businessDoc.id, ...businessDoc.data() })
        }
      }
    }

    return { businesses, error: null }
  } catch (error) {
    return { businesses: { co: [], nm: [] }, error: error.message }
  }
}

// Auth state observer
export const onAuthStateChange = (callback) => {
  if (typeof window !== 'undefined') {
    return onAuthStateChanged(auth, callback)
  }
  return () => {}
}

export { auth, db }
