/**
 * Script to set admin role for a user
 *
 * Usage:
 * node scripts/set-admin-role.js <user-email>
 */

const admin = require('firebase-admin')
const path = require('path')
const fs = require('fs')

// Check for command line arguments
if (process.argv.length < 3) {
  console.error('Please provide a user email as an argument')
  console.error('Usage: node scripts/set-admin-role.js <user-email>')
  process.exit(1)
}

const userEmail = process.argv[2]

// Initialize Firebase Admin SDK
try {
  // Try to load service account from file
  const serviceAccountPath = path.join(__dirname, '..', 'service-account.json')

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath)

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  } else {
    // Fall back to environment variables
    if (
      !process.env.FIREBASE_ADMIN_PROJECT_ID ||
      !process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
      !process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ) {
      console.error('Error: No service account file found and environment variables not set')
      console.error('Please either:')
      console.error('1. Create a service-account.json file in the project root')
      console.error('2. Set the FIREBASE_ADMIN_* environment variables')
      process.exit(1)
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    })
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error)
  process.exit(1)
}

async function setAdminRole(email) {
  try {
    // Get the user by email
    const userRecord = await admin.auth().getUserByEmail(email)

    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'admin' })

    // Update the user document in Firestore
    const db = admin.firestore()
    await db.collection('users').doc(userRecord.uid).update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log(`Successfully set admin role for user: ${email} (${userRecord.uid})`)

    // Verify the claims were set
    const updatedUser = await admin.auth().getUser(userRecord.uid)
    console.log('User custom claims:', updatedUser.customClaims)

    return userRecord.uid
  } catch (error) {
    console.error('Error setting admin role:', error)
    process.exit(1)
  }
}

// Run the function
setAdminRole(userEmail)
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Unexpected error:', error)
    process.exit(1)
  })
