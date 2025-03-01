# Firebase Setup Instructions

This document provides instructions on how to set up Firebase for the NMCO Meds application.

## Client-Side Firebase Setup

1. **Create a Firebase Project**:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Enable Google Analytics if desired

2. **Register Your Web App**:
   - In the Firebase console, click on the web icon (</>) to add a web app
   - Enter a nickname for your app (e.g., "NMCO Meds Web")
   - Check the box for "Also set up Firebase Hosting" if desired
   - Click "Register app"

3. **Copy Your Firebase Configuration**:
   - After registering, you'll see a configuration object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```
   - Copy these values to your `.env` file

4. **Enable Authentication Methods**:
   - In the Firebase console, go to "Authentication" > "Sign-in method"
   - Enable "Email/Password" and "Google" authentication methods

5. **Set Up Firestore Database**:
   - In the Firebase console, go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in production mode" or "Start in test mode" (for development)
   - Select a location for your database
   - Create the following collections:
     - `users`
     - `businesses-co`
     - `businesses-nm`
     - `corporate-groups`

## Server-Side Firebase Admin Setup

For server-side operations, you need to set up the Firebase Admin SDK:

1. **Generate a Private Key**:
   - In the Firebase console, go to "Project settings" > "Service accounts"
   - Click "Generate new private key"
   - Save the JSON file securely

2. **Set Up Service Account**:
   - Rename the downloaded JSON file to `service-account.json`
   - Place it in the root directory of your project
   - Make sure it's added to `.gitignore` to prevent committing sensitive credentials

3. **Alternative: Use Environment Variables**:
   - Instead of using the JSON file, you can set the following environment variables:
   ```
   FIREBASE_ADMIN_PROJECT_ID=your-project-id
   FIREBASE_ADMIN_CLIENT_EMAIL=your-client-email
   FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
   ```
   - Note: For the private key, you may need to replace newlines with `\n`

## Setting Up Admin Users

To create an admin user:

1. **Register a Regular User**:
   - Register a new user through the application's registration form
   - This will create a user with the default "operator" role

2. **Promote to Admin (Using Firebase Console)**:
   - In the Firebase console, go to "Authentication" > "Users"
   - Find the user you want to promote
   - Copy their User UID

3. **Update User Claims in Firestore**:
   - Go to "Firestore Database"
   - Find the user document in the `users` collection
   - Update the `role` field to "admin"

4. **Alternative: Using Firebase Admin SDK**:
   - You can use the Firebase Admin SDK to programmatically set custom claims:
   ```javascript
   import admin from 'firebase-admin';
   
   // Initialize admin app...
   
   async function setAdminRole(uid) {
     try {
       await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
       console.log('Successfully set admin role');
     } catch (error) {
       console.error('Error setting admin role:', error);
     }
   }
   
   // Call with the user's UID
   setAdminRole('user-uid-here');
   ```

## Security Rules

Set up Firestore security rules to protect your data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Only admins can read all users
    match /users/{userId} {
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Businesses can be read by anyone, but only written by their owners or admins
    match /businesses-co/{businessId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (businessId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.businessIds.co || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    match /businesses-nm/{businessId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (businessId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.businessIds.nm || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Corporate groups can only be managed by their owners or admins
    match /corporate-groups/{groupId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.ownerId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && 
        (request.auth.uid == resource.data.ownerId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

## Deployment

1. **Deploy to Firebase Hosting** (optional):
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Login to Firebase: `firebase login`
   - Initialize Firebase: `firebase init`
   - Deploy: `firebase deploy`

2. **Environment Variables in Production**:
   - For Firebase Hosting, set environment variables in the Firebase console
   - For other hosting providers, follow their documentation for setting environment variables 