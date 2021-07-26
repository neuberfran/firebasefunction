const functions = require('firebase-functions');
const { firestore } = require('../admin');

/**
 * Cloud Function: Handle device connectivity changes
 */
module.exports = functions.pubsub.topic('online-state').onPublish(async (message) => {
  const logEntry = JSON.parse(Buffer.from(message.data, 'base64').toString());
  const deviceId = logEntry.labels.device_id;

  let online;
  switch (logEntry.jsonPayload.eventType) {
    case 'CONNECT':
      online = true;
      break;
    case 'DISCONNECT':
      online = false;
      break;
    default:
      throw new Error(`Invalid event type received from IoT Core: ${logEntry.jsonPayload.eventType}`);
  }

  // Write the online state into firestore
  const deviceRef = firestore.doc(`devices/${deviceId}`);
  try {
    await deviceRef.update({ 'online': online });
    console.log(`Connectivity updated for ${deviceId}`);
  } catch (error) {
    console.error(`${deviceId} not yet registered to a user`, error);
  }
});
