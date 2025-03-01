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
const functions = require('firebase-functions')
const db = require('firebase-admin').firestore()

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

// Invite a user to a business
exports.inviteUserToBusiness = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to invite users.'
    );
  }

  const { email, businessId, state, role, isAdminInvite } = data;

  // Validate input
  if (!email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email is required.'
    );
  }

  // For non-admin invites, businessId and state are required
  if (!isAdminInvite && (!businessId || !state)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Business ID and state are required.'
    );
  }

  try {
    // Get the current user's profile
    const userRef = db.collection('users').doc(context.auth.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User profile not found.'
      );
    }

    const userData = userDoc.data();
    
    // Handle admin invites differently
    if (isAdminInvite) {
      // Check if the current user is an admin
      if (userData.role !== 'admin') {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Only admins can send admin invites.'
        );
      }
      
      // Create or update the user invitation
      const inviteRef = db.collection('invitations').doc(email.toLowerCase());
      await inviteRef.set({
        email: email.toLowerCase(),
        role: role,
        invitedBy: context.auth.uid,
        invitedAt: admin.firestore.FieldValue.serverTimestamp(),
        isAdminInvite: true
      });
      
      return { message: `Invitation sent to ${email}` };
    }
    
    // For regular business invites
    // Check if the user has permission to invite to this business
    const businessRef = db.collection(`businesses-${state.toLowerCase()}`).doc(businessId);
    const businessDoc = await businessRef.get();

    if (!businessDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Business not found.'
      );
    }

    const businessData = businessDoc.data();

    // Check if the user is an admin or the owner of the business
    const isAdmin = userData.role === 'admin';
    const isOwner = userData.businesses && userData.businesses.some(
      b => b.businessId === businessId && b.role === 'owner'
    );

    if (!isAdmin && !isOwner) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to invite users to this business.'
      );
    }

    // Check if the business already has 3 users (unless the inviter is an admin)
    if (!isAdmin && businessData.users && businessData.users.length >= 3) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'This business has reached the maximum number of users. Please upgrade your subscription to add more users.'
      );
    }

    // Create or update the user invitation
    const inviteRef = db.collection('invitations').doc(email.toLowerCase());
    await inviteRef.set({
      email: email.toLowerCase(),
      businessId: businessId,
      state: state,
      role: role,
      invitedBy: context.auth.uid,
      invitedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { message: `Invitation sent to ${email}` };
  } catch (error) {
    console.error('Error inviting user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while inviting the user.'
    );
  }
});
