const admin = require('firebase-admin');
const app = admin.initializeApp();

const firestore = app.firestore();
const auth = app.auth();

module.exports = {
    auth,
    firestore
}