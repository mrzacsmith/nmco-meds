const admin = require('firebase-admin')
const serviceAccount = require('../service-account.json')

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

async function updateAdminBannedStatus() {
  try {
    // Get all admin users
    const adminUsers = await db.collection('users').where('role', '==', 'admin').get()

    console.log(`Found ${adminUsers.size} admin users`)

    // Update each admin user
    const batch = db.batch()
    adminUsers.forEach((doc) => {
      batch.update(doc.ref, { banned: false })
      console.log(`Adding banned: false to admin ${doc.id}`)
    })

    // Commit the batch
    await batch.commit()
    console.log('Successfully updated all admin users')
  } catch (error) {
    console.error('Error updating admin users:', error)
  } finally {
    // Exit the script
    process.exit(0)
  }
}

// Run the update
updateAdminBannedStatus()
