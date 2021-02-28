
const functions = require('firebase-functions');
const { firestore } = require('../admin');

/**
 * Cloud Function: Handle device state updates
 */
module.exports = functions.pubsub.topic('device-events').onPublish(async (message) => {
  const deviceId = message.attributes.deviceId;

  // Write the device state into firestore
  const deviceRef = firestore.doc(`devices/${deviceId}`);
  try {
    // Ensure the device is also marked as 'online' when state is updated
    await deviceRef.update({
      'state': message.json, 
      'online': true });
    console.log(`State updated for ${deviceId}`);
  } catch (error) {
    console.error(`${deviceId} not yet registered to a user`, error);
  }
});
