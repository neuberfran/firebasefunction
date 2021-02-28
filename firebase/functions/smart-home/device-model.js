class Device {
  constructor(id, data) {
    this.id = id;
    this.name = data.name;
    this.owner = data.owner;
    this.online = data.online;
    this.type = data.type;
    this.state = data.state;
  }

  /**
   * Return the correct device based on type
   */
  static createDevice(id, data) {
    // Verify device type
    switch (data.type) {
      case 'alarm':
        return new AlarmDevice(id, data);
      case 'garage':
        return new GarageDevice(id, data);
      default:
        throw new Error(`Invalid device type found in ${id}: ${data.type}`);
    }
  }

  /**
   * Construct device state payload from the given Assistant commands
   */
  static stateFromExecution(execution) {
    const state = {};
    execution.forEach(item => {
      switch (item.command) {
        case 'action.devices.commands.OnOff':
          state['value.on'] = item.params.on;
          break;        
        default:
          throw new Error(`Invalid command received: ${item.command}`);
      }
    });

    return state;
  }
};

/**
 * Traits for a Alarm device
 */
class AlarmStateDevice extends Device {
  get metadata() {
    return {
      id: this.id,
      type: 'action.devices.types.LIGHT',
      traits: [
        'action.devices.traits.OnOff',
      ],
      name: {
        name: this.name
      },
      willReportState: true
    };
  }

  get reportState() {
    return {
      online: this.online,
      on: this.state.on
    };
  }
};

/**
 * Traits for a Garage device
 */
class GarageDevice extends Device {
  get metadata() {
    return {
      id: this.id,
      type: 'action.devices.types.GARAGE',
      traits: [
        'action.devices.traits.OpenCLose',
      ],
      name: {
        name: this.name
      },
      willReportState: true
    };
  }

  get reportState() {
    return {
      online: this.online,
      on: this.state.on
    };
  }
};

module.exports = Device;