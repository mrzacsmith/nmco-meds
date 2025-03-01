/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require('firebase-functions/v2/https')
const { onCall } = require('firebase-functions/v2/https')
const { onUserCreated } = require('firebase-functions/v2/identity')
const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const express = require('express')
const path = require('path')
const fs = require('fs')
const admin = require('firebase-admin')

// Initialize Firebase Admin
admin.initializeApp()

// Admin email addresses
const ADMIN_EMAILS = [
  'zac@codeshock.dev',
  'alexandra@codeshock.dev'
]

// Create an Express app
const app = express()

// Serve static assets
app.use(express.static(path.join(__dirname, '../build/client')))

// Handle all requests with a simple HTML file that loads the client-side JS
app.all('*', (req, res) => {
  // Read the index.html template
  const indexPath = path.join(__dirname, '../build/client/index.html')

  // If the file exists, send it
  if (fs.existsSync(indexPath)) {
    // Read the file content
    const indexContent = fs.readFileSync(indexPath, 'utf8')

    // Send the file with the correct content type
    res.set('Content-Type', 'text/html')
    res.send(indexContent)
  } else {
    // Create a more complete HTML file with the necessary Remix scripts
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>NMCO Meds</title>
  <link rel="stylesheet" href="/assets/root-UZaPFPvA.css">
</head>
<body>
  <div id="root"></div>
  <script>
    window.__remixContext = {
      state: {
        loaderData: {},
        actionData: null,
        errors: null
      },
      future: {
        v2_meta: true,
        unstable_postcss: true,
        unstable_tailwind: true,
        v2_errorBoundary: true,
        v2_normalizeFormMethod: true,
        v2_routeConvention: true
      }
    };
  </script>
  <script type="module" src="/assets/entry.client-BRx4lJ-n.js"></script>
</body>
</html>
    `
    res.set('Content-Type', 'text/html')
    res.send(html)
  }
})

// Export the Cloud Function
exports.app = onRequest(
  {
    region: 'us-central1',
    memory: '1GiB',
  },
  app
)

// Function to set admin claims when a user is created
exports.processNewUser = onUserCreated({
  region: 'us-central1',
  maxInstances: 10,
}, async (event) => {
  const user = event.data
  
  // Check if the user's email is in the admin list
  if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    try {
      // Set custom claims for admin
      await admin.auth().setCustomUserClaims(user.uid, { 
        admin: true,
        role: 'admin',
        accessibleStates: ['NM', 'CO']
      })
      
      console.log(`Set admin role for user: ${user.email}`)
    } catch (error) {
      console.error('Error setting admin role:', error)
    }
  }
})

// Function to invite a user to a business
exports.inviteUserToBusiness = onCall({
  region: 'us-central1',
  maxInstances: 10,
}, async (request) => {
  // Ensure the user is authenticated
  if (!request.auth) {
    throw new Error('Unauthorized')
  }
  
  const { email, businessId, state, role } = request.data
  
  if (!email || !businessId || !state) {
    throw new Error('Missing required fields')
  }
  
  try {
    // Get the current user's profile
    const callerDoc = await admin.firestore().collection('users').doc(request.auth.uid).get()
    
    if (!callerDoc.exists) {
      throw new Error('User profile not found')
    }
    
    const callerData = callerDoc.data()
    
    // Check if the caller is an admin or the owner of the business
    const isAdmin = callerData.role === 'admin'
    const isOwner = callerData.businesses && callerData.businesses.some(b => 
      b.businessId === businessId && b.state === state && b.role === 'owner'
    )
    
    if (!isAdmin && !isOwner) {
      throw new Error('You do not have permission to invite users to this business')
    }
    
    // Check if the business exists
    const businessDoc = await admin.firestore().collection(`businesses-${state.toLowerCase()}`).doc(businessId).get()
    
    if (!businessDoc.exists) {
      throw new Error('Business not found')
    }
    
    // Check if the business already has 3 users (including the owner)
    const businessData = businessDoc.data()
    if (businessData.users && businessData.users.length >= 3 && !isAdmin) {
      throw new Error('This business already has the maximum number of users (3)')
    }
    
    // Check if the user already exists
    let userId = null
    try {
      const userRecord = await admin.auth().getUserByEmail(email)
      userId = userRecord.uid
    } catch (error) {
      // User doesn't exist, we'll create an invitation instead
      // For now, just return an error
      throw new Error('User not found. Please ask them to register first.')
    }
    
    // Get the user's profile
    const userDoc = await admin.firestore().collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      throw new Error('User profile not found')
    }
    
    const userData = userDoc.data()
    
    // Check if the user is already associated with this business
    if (userData.businesses && userData.businesses.some(b => b.businessId === businessId && b.state === state)) {
      throw new Error('User is already associated with this business')
    }
    
    // Update the user's profile
    await admin.firestore().collection('users').doc(userId).update({
      businesses: admin.firestore.FieldValue.arrayUnion({
        businessId,
        state,
        role: role || 'operator'
      }),
      accessibleStates: admin.firestore.FieldValue.arrayUnion(state)
    })
    
    // Update the business document
    await admin.firestore().collection(`businesses-${state.toLowerCase()}`).doc(businessId).update({
      users: admin.firestore.FieldValue.arrayUnion({
        userId,
        role: role || 'operator',
        permissions: ['read'],
        email
      })
    })
    
    return { success: true, message: 'User successfully invited to the business' }
  } catch (error) {
    console.error('Error inviting user:', error)
    throw new Error(error.message)
  }
})
