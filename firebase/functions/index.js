module.exports = {
  // Device Cloud Functions
  deviceState: require('./device-cloud/device-state'),
  onlineState: require('./device-cloud/online-state'),
   // Smart Home Functions
  token: require('./smart-home/token'),
  compatible2: require('./smart-home/compatible2'),
  compatible: require('./smart-home/compatible'),
  fulfillment: require('./smart-home/fulfillment'),
  reportState: require('./smart-home/report-state'),
  syncOnAdd: require('./smart-home/request-sync').add,
  syncOnRemove: require('./smart-home/request-sync').remove,
};