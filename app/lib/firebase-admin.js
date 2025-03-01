import admin from 'firebase-admin'
import { createRequire } from 'module'

// Initialize Firebase Admin SDK
let adminApp

if (!admin.apps.length) {
  try {
    // For production, use environment variables or a secure way to store credentials
    // For development, you can use a service account key file

    // Method 1: Using environment variables (recommended for production)
    if (process.env.FIREBASE_ADMIN_PROJECT_ID) {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      })
    }
    // Method 2: Using a service account key file (easier for development)
    else {
      try {
        // Dynamic import for service account (only in Node.js environment)
        const require = createRequire(import.meta.url)
        const serviceAccount = require('../../service-account.json')

        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        })
      } catch (error) {
        console.error('Error loading service account file:', error)
        console.warn(
          'Firebase Admin SDK not initialized. Please provide service account credentials.'
        )
      }
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error)
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null
export const adminFirestore = admin.apps.length ? admin.firestore() : null
export const adminStorage = admin.apps.length ? admin.storage() : null

// Admin functions

// Verify ID token and get user
export const verifyIdToken = async (idToken) => {
  try {
    if (!adminAuth) throw new Error('Firebase Admin not initialized')
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return { uid: decodedToken.uid, error: null }
  } catch (error) {
    return { uid: null, error: error.message }
  }
}

// Get user by ID
export const getUserById = async (uid) => {
  try {
    if (!adminAuth) throw new Error('Firebase Admin not initialized')
    const userRecord = await adminAuth.getUser(uid)
    return { user: userRecord, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

// Create custom token
export const createCustomToken = async (uid, claims = {}) => {
  try {
    if (!adminAuth) throw new Error('Firebase Admin not initialized')
    const token = await adminAuth.createCustomToken(uid, claims)
    return { token, error: null }
  } catch (error) {
    return { token: null, error: error.message }
  }
}

// Set custom user claims
export const setCustomUserClaims = async (uid, claims) => {
  try {
    if (!adminAuth) throw new Error('Firebase Admin not initialized')
    await adminAuth.setCustomUserClaims(uid, claims)
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Get user by email
export const getUserByEmail = async (email) => {
  try {
    if (!adminAuth) throw new Error('Firebase Admin not initialized')
    const userRecord = await adminAuth.getUserByEmail(email)
    return { user: userRecord, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

export default admin
