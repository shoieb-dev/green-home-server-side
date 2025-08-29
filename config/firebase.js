// backend/config/firebase.js
const admin = require("firebase-admin");

const serviceAccount = require("../serviceAccountKey.json");
// Download this from Firebase project settings

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
