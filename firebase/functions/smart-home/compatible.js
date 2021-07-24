const functions = require("firebase-functions");
const admin = require("firebase-admin");
//const { firestore, firestorec } = require('../admin')
//admin.initializeApp();
//firestore.app;
exports.updateGarage = functions.firestore
.document('device-configs/garagem2')
.onUpdate((change, context) => {

    //Get the latest value after update
    const newValue = change.after.data();

    //Current state of garage
    const garagestatev = newValue.garagestate;

    console.log("garagestatev 921 ==" + garagestatev);

    return admin.firestore().doc('device-configs/garagem').get()
        .then((areaSnapshot) => areaSnapshot.data().value.openPercent)
        .then(targetDoc => {

            //Target doc has openPercent of other document ('garagem')
            if (garagestatev) {
                console.log("garagestatev 921 ==" + garagestatev);
                console.log("value.openPercent  = 922 = targetDodc" + targetDoc);    

                if (targetDoc === 100) {
                    console.log("vou mandar 0");
                    //Returning Promise inside of .then() block 
                    return admin.firestore() 
                        .collection('device-configs')
                        .doc('garagem')
                        .update({'gpiogaragestate':false , 'value.openPercent': 0 });
                }

            } else {

                console.log("garagestatev 921 ==" + garagestatev);
                console.log("value.openPercent  = 923 = targetDodc" + targetDoc);

                if (targetDoc === 0) {
                    console.log("vou mandar 100");
                    //Returning Promise inside of .then() block 
                    return admin.firestore()
                        .collection('device-configs')
                        .doc('garagem')
                       .update({'gpiogaragestate':false , 'value.openPercent': 100 });
  
            }
            }
        })

});
