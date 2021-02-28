const functions = require('firebase-functions');
const { firestore } = require('../admin');
const { smarthome } = require('actions-on-google');

const homegraph = smarthome({
  jwt: require('./service-account.json')
});

/**
 * Cloud Function: Request a sync with the Assistant HomeGraph
 * on device add
 */
module.exports.add = functions.firestore.document('devices/{device}')
  .onCreate(handleRequestSync);

/**
 * Cloud Function: Request a sync with the Assistant HomeGraph
 * on device remove
 */
module.exports.remove = functions.firestore.document('devices/{device}')
  .onDelete(handleRequestSync);

/**
 * Handler to request SYNC through the HomeGraph API
 */
async function handleRequestSync(snapshot, context) {
  // Obtain the device owner UID
  const userId = snapshot.data().owner;

  // Check if user has linked to Assistant
  const linked = await verifyAccountLink(userId);
  if (!linked) {
    console.log(`User ${userId} not linked to Assistant`);
    return;
  }

  // Send a sync request
  console.log(`Requesting SYNC for account: ${userId}`);
  await homegraph.requestSync(userId);
}

/**
 * Verify if the user has linked their account to the Assistant
 */
async function verifyAccountLink(userId) {
  const userRef = firestore.doc(`users/${userId}`);
  const user = await userRef.get();
  return (user.exists && user.data().hasOwnProperty('refresh_token'));
}