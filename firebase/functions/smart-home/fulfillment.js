const functions = require('firebase-functions')
const { firestore } = require('../admin')
const { smarthome } = require('actions-on-google')
const Device = require('./device-model')
const jwt = require('jsonwebtoken')

const fulfillment = smarthome()

/**
 * SYNC Intent Handler
 */
fulfillment.onSync(async (body, headers) => {
    try {
        const userId = validateCredentials(headers)
        // Return all devices registered to the requested user
        const result = await firestore
            .collection('devices')
            .where('owner', '==', userId)
            .get()
        const deviceList = result.docs.map((doc) => {
            const device = Device.createDevice(doc.id, doc.data())
            return device.metadata
        })

        console.log('SYNC Response', deviceList)
        return {
            requestId: body.requestId,
            payload: {
                agentUserId: userId,
                devices: deviceList,
            },
        }
    } catch (error) {
        console.error('Unable to authenticate SYNC request', error)
        return {
            requestId: body.requestId,
            payload: {
                errorCode: 'authFailure',
                debugString: error.toString(),
            },
        }
    }
})

/**
 * QUERY Intent Handler
 */
fulfillment.onQuery(async (body, headers) => {
    try {
        validateCredentials(headers)

        const deviceSet = {}
        // Return device state for the requested device ids
        for (const target of body.inputs[0].payload.devices) {
            const doc = await firestore.doc(`devices/${target.id}`).get()
            const device = Device.createDevice(doc.id, doc.data())
            deviceSet[device.id] = device.reportState
        }

        console.log('QUERY Response', deviceSet)
        return {
            requestId: body.requestId,
            payload: {
                devices: deviceSet,
            },
        }
    } catch (error) {
        console.error('Unable to authenticate QUERY request', error)
        return {
            requestId: body.requestId,
            payload: {
                errorCode: 'authFailure',
                debugString: error.toString(),
            },
        }
    }
})

/**
 * EXECUTE Intent Handler
 */
fulfillment.onExecute(async (body, headers) => {
    try {
        validateCredentials(headers)
        // Update the device configs for each requested id
        let reqCommand = body.inputs[0].payload.commands[0]
        const command = body.inputs[0].payload.commands[0]
        console.log('EXECUTE Request', command)
        // Apply the state update to each device
        const update = Device.stateFromExecution(command.execution)
        const batch = firestore.batch()

        for (const target of command.devices) {
            const configRef = firestore.doc(`device-configs/garagem2`)
            const configRef5 = firestore.doc(`device-configs/cerca2`)
            const targetDoc = await configRef.get()
            const targetDoc5 = await configRef5.get()
            const { cercastate } = targetDoc5.data()
            const { garagestate } = targetDoc.data()
     //       const configRef2 = firestore.doc(`device-configs/${target.id}`)
            const configRef7 = firestore.doc(`device-configs/${target.id}`)
       //     const targetDoc2 = await configRef2.get()
            const targetDoc7 = await configRef7.get()
            const { gpiogaragestate } = targetDoc7.data()
            const { gpiocercastate } = targetDoc7.data()
            let params = reqCommand.execution[0].params
            let command = reqCommand.execution[0].command
            console.log('COMMAND.EXECUTION', command)
            console.log(
                'reqCommand.execution - cerca2',
                reqCommand.execution[0].params.on
            )
            console.log(
                'reqCommand.execution - Garagem',
                reqCommand.execution[0].params.openPercent
            )
            console.log('Params variavel=', params)

           console.log('gpiocercastate - 927 = ', gpiocercastate)

           console.log('gpiogaragestate - 927 = ', gpiogaragestate)

       //   Cerca abaixo
            if (
                cercastate === false &&
                command === 'action.devices.commands.OnOff' &&
                reqCommand.execution[0].params.on === false
            ) {
                return {
                    requestId,
                    payload: {
                        status: 'ERROR',
                        errorCode: 'alreadyOff',
                    },
                }
            } else if (
                cercastate === true &&
                command === 'action.devices.commands.OnOff' &&
                reqCommand.execution[0].params.on === true
            ) {
                return {
                    requestId,
                    payload: {
                        status: 'ERROR',
                        errorCode: 'alreadyOn',
                    },
                }
            }

            // Garagem abaixo
            if (
                garagestate === true &&
                command === 'action.devices.commands.OpenClose' &&
                reqCommand.execution[0].params.openPercent === 0

            ) {
                return {
                    requestId,
                    payload: {
                        status: 'ERROR',
                        errorCode: 'alreadyClosed',
                    },
                }
            } else if (
                garagestate === false &&
                command === 'action.devices.commands.OpenClose' &&
                reqCommand.execution[0].params.openPercent === 100
            ) {
                return {
                    requestId,
                    payload: {
                        status: 'ERROR',
                        errorCode: 'alreadyOpen',
                    },
                }
            }

            if(

                cercastate === true &&
                command === 'action.devices.commands.OpenClose' &&
                reqCommand.execution[0].params.openPercent === 100)

             { await firestore.doc(`device-configs/cerca`).update({ 'gpiocercastate':true, 'value.on':true })}

         
           await firestore.doc(`device-configs/${target.id}`).update({ 'gpiogaragestate':true })

           await firestore.doc(`device-configs/${target.id}`).update({ 'gpiocercastate':true })

           // /${target.id}


           batch.update(configRef7, update)
           
        }

        await batch.commit()

        return {
            requestId: body.requestId,
            payload: {
                commands: [
                    {
                        ids: command.devices.map((device) => device.id),
                        status: 'PENDING',
                    },
                ],
            },
        }
    } catch (error) {
        console.error('Unable to authenticate EXECUTE request', error)
        return {
            requestId: body.requestId,
            payload: {
                errorCode: 'authFailure',
                debugString: error.toString(),
            },
        }
    }
})
/**
 * DISCONNECT Intent Handler
 */
fulfillment.onDisconnect(async (body, headers) => {
    try {
        const userId = validateCredentials(headers)

        // Clear the user's current refresh token
        const userRef = firestore.doc(`users/${userId}`)
        await userRef.delete()
        console.log(`Account unlinked: ${userId}`)
        // Return empty body
        return {}
    } catch (error) {
        console.error('Unable to authenticate DISCONNECT request', error)
        return {
            requestId: body.requestId,
            payload: {
                errorCode: 'authFailure',
                debugString: error.toString(),
            },
        }
    }
})

/**
 * Verify the request credentials provided by the caller.
 * If successful, return UID encoded in the token.
 */
function validateCredentials(headers) {
    if (
        !headers.authorization ||
        !headers.authorization.startsWith('Bearer ')
    ) {
        throw new Error('Request missing valid authorization')
    }

    const jwt_secret = functions.config().smarthome.key
    const token = headers.authorization.split('Bearer ')[1]
    const decoded = jwt.verify(token, jwt_secret)

    return decoded.sub
}

/**
 * Cloud Function: Handler for Smart Home intents
 */
module.exports = functions.https.onRequest(fulfillment)
