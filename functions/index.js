/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require('firebase-functions/v2/https')
const express = require('express')
const path = require('path')
const fs = require('fs')

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
