// Firebase configuration and utilities
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
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

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCJn1kwD72StdEuDX7iAsbPVh7r68ATjEE',
  authDomain: 'nmco-meds.firebaseapp.com',
  projectId: 'nmco-meds',
  storageBucket: 'nmco-meds.firebasestorage.app',
  messagingSenderId: '115607600008',
  appId: '1:115607600008:web:44236c3f5bafb51758983d',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

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
    await createUserProfile(userCredential.user.uid, {
      ...userData,
      email,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
    })
    return { user: userCredential.user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)

    // Check if user profile exists
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))

    if (!userDoc.exists()) {
      // Create user profile if it doesn't exist
      await createUserProfile(userCredential.user.uid, {
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
      })
    } else {
      // Update last login
      await updateLastLogin(userCredential.user.uid)
    }

    return { user: userCredential.user, error: null }
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
      return { data: null, error: 'User profile not found' }
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

export const getBusinessesByState = async (state) => {
  try {
    const businessesQuery = query(collection(db, 'businesses'), where('state', '==', state))
    const querySnapshot = await getDocs(businessesQuery)
    const businesses = []
    querySnapshot.forEach((doc) => {
      businesses.push({ id: doc.id, ...doc.data() })
    })
    return { data: businesses, error: null }
  } catch (error) {
    return { data: [], error: error.message }
  }
}

export { auth, db }
