const functions = require("firebase-functions");
const admin = require("firebase-admin");
//const { admin } = require('../admin');
//admin.initializeApp();
//firestore.app;
exports.updateCerca = functions.firestore
.document('device-configs/cerca2')
.onUpdate((change, context) => {

    //Get the latest value after update
    const newValue2 = change.after.data();

    //Current state of cerca2
    const cercastatev = newValue2.cercastate;

    console.log("cercastatev 921 ==" + cercastatev);

    return admin.firestore().doc('device-configs/cerca').get()
        .then((areaSnapshot3) => areaSnapshot3.data().value.on)
        .then(targetDoc3=> {

            //Target doc has on of other document ('cerca')
            if (cercastatev) {
                console.log("cercastatev 911 ==" + cercastatev);
                console.log("value.on  = 912 = targetDodc3" + targetDoc3);    

                if (!targetDoc3) {
                    console.log("vou mandar TRUE");
                    //Returning Promise inside of .then() block 
                    return admin.firestore() 
                        .collection('device-configs')
                        .doc('cerca')
                        .update({'gpiocercastate':false , 'value.on': true });
                }

            } else {

                console.log("cercastatev 941 ==" + cercastatev);
                console.log("value.on  = 913 = targetDodc3" + targetDoc3);

                if (targetDoc3) {
                    console.log("vou mandar FALSE");
                    //Returning Promise inside of .then() block 
                    return admin.firestore()
                        .collection('device-configs')
                        .doc('cerca')
                       .update({'gpiocercastate':false , 'value.on': false });
            }
            }
        })
});