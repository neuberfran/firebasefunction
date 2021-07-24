class Device {
    constructor(id, data) {
        this.id = id
        this.name = data.name
        this.owner = data.owner
        this.online = data.online
        this.type = data.type
        this.state = data.state
    }

    /**
     * Return the correct device based on type
     */
    static createDevice(id, data) {
        // Verify device type
        switch (data.type) {
            case 'light':
                return new CercaStateDevice(id, data);
            case 'garage':
                return new GaragemDevice(id, data);
            default:
                throw new Error(
                    `Invalid device type found in ${id}: ${data.type}`);
        }
    }

    /**
     * Construct device state payload from the given Assistant commands
     */
    static stateFromExecution(execution) {
        const state = {};
        execution.forEach((item) => {
            switch (item.command) {
                case 'action.devices.commands.OnOff':
                    state['value.on'] = item.params.on;
                    break;
                case 'action.devices.commands.OpenClose':
                    state['value.openPercent'] = item.params.openPercent;
                    break;
                default:
                    throw new Error(`Invalid command received: ${item.command}`);
            }
        });

        return state;
    }
};

/**
 * Traits for a cerca device
 */
class CercaStateDevice extends Device {
    get metadata() {
        return {
            id: this.id,
            type: 'action.devices.types.LIGHT',
            traits: [
                'action.devices.traits.OnOff'
                //        'action.devices.traits.Brightness'
            ],
            name: {
                name: this.name
            },
            willReportState: true
        }
    }

    get reportState() {
        return {
            online: this.online,
            on: this.state.on
            //    brightness: this.state.brightness
        }
    }
}

/**
 * Traits for a Garage device
 */
class GaragemDevice extends Device {
    get metadata() {
        return {
            id: this.id,
            type: 'action.devices.types.GARAGE',
            traits: ['action.devices.traits.OpenClose'],
            name: {
                name: this.name
            },
            willReportState: true
        }
    }

    get reportState() {
        return {
            online: this.online,
            openPercent: this.state.openPercent
        };
    }
};

module.exports = Device;
