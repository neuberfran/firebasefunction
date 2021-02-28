const functions = require('firebase-functions');
const { firestore } = require('../admin');
const { smarthome } = require('actions-on-google');
const Device = require('./device-model');
const uuid = require('uuid/v4');

const homegraph = smarthome({
  jwt: require('./service-account.json')
});

/**
 * Cloud Function: Report device state changes to Assistant HomeGraph
 */
module.exports = functions.firestore.document('devices/{device}').onUpdate(async (change, context) => {
  const deviceId = context.params.device;
  const device = Device.createDevice(deviceId, change.after.data());

  // Check if user has linked to Assistant
  const linked = await verifyAccountLink(device.owner);
  if (!linked) {
    console.log(`User ${device.owner} not linked to Assistant`);
    return;
  }

  // Send a state report
  const report = {};
  report[device.id] = device.reportState;
  console.log('Sending state report', report);
  await homegraph.reportState({
    requestId: uuid(),
    agentUserId: device.owner,
    payload: {
      devices: {
        states: report
      }
    }
  });
});

/**
 * Verify if the user has linked their account to the Assistant
 */
async function verifyAccountLink(userId) {
  const userRef = firestore.doc(`users/${userId}`);
  const user = await userRef.get();
  return (user.exists && user.data().hasOwnProperty('refresh_token'));
}
