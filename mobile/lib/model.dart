
import 'package:flutter/material.dart';

/// Base device mode for all support device types
abstract class Device {
  Device({this.id, this.name, this.online});

  final String id;
  final String name;
  final bool online;

  factory Device.fromData(Map<String, dynamic> data, String id) {
    switch (data['type']) {
      case 'light':
        return LightDevice.fromData(data, id);
      case 'thermostat':
        return ThermostatDevice.fromData(data, id);
      default:
        throw("Invalid device type");
    }
  }

  /// Return the correct icon type for the device
  IconData get deviceIcon;
  /// Return a UI status message for the device
  String get deviceStatus;
  /// Report the initial value for the control UI
  num get setpoint;
  String get mode;
  /// Boundary conditions for the control UI
  double get minSetpoint;
  double get maxSetpoint;
  List<String> get availableModes;
  /// Return a representation of the new device configuration
  Map<String, dynamic> getUpdatedValue(num newSetpoint, String newMode);
}

/// Implementation of a smart light device
class LightDevice extends Device {
  LightDevice({String id, String name, bool online, @required this.isOn, @required this.brightness})
    : super(id: id, name: name, online: online);

  final bool isOn;
  final num brightness;

  LightDevice.fromData(Map<String, dynamic> data, String id)
    : this(
        id: id,
        name: data['name'],
        online: data['online'] && data['state'] != null,
        isOn: (data['state'] != null) ? data['state']['on'] : false,
        brightness: (data['state'] != null) ? data['state']['brightness'] : 0
      );

  @override
  IconData get deviceIcon => Icons.lightbulb_outline;

  @override
  String get deviceStatus {
    if (!this.online) {
      return 'Offline';
    }

    if (!this.isOn) {
      return 'OFF';
    }

    return "Brightness: ${this.brightness}";
  }

  @override
  num get setpoint => this.brightness;
  @override
  double get minSetpoint => 0.0;
  @override
  double get maxSetpoint => 100.0;
  @override
  String get mode => this.isOn ? 'on' : 'off';
  @override
  List<String> get availableModes => ['off', 'on'];

  @override
  Map<String, dynamic> getUpdatedValue(num newSetpoint, String newMode) =>
    {
      'brightness': newSetpoint.round(),
      'on': (newMode == 'on')
    };
}

/// Implementation of a smart thermostat device
class ThermostatDevice extends Device {
  ThermostatDevice({String id, String name, bool online, @required this.mode, @required this.setpoint})
    : super(id: id, name: name, online: online);

  final String mode;
  final num setpoint;

  ThermostatDevice.fromData(Map<String, dynamic> data, String id)
    : this(
      id: id,
      name: data['name'],
      online: data['online'] && data['state'] != null,
      mode: (data['state'] != null) ? data['state']['mode'] : 'off',
      setpoint: (data['state'] != null) ? data['state']['setpoint'] : 0
    );

  @override
  IconData get deviceIcon => Icons.ac_unit;

    @override
  String get deviceStatus {
    if (!this.online) {
      return 'Offline';
    }

    switch(this.mode) {
      case 'off':
        return 'OFF';
      case 'heat':
        return "Heating to ${this.setpoint}";
      case 'cool':
        return "Cooling to ${this.setpoint}";
      default:
        return 'Error: Invalid mode';
    }
  }

  @override
  double get minSetpoint => 10.0;
  @override
  double get maxSetpoint => 32.0;
  @override
  List<String> get availableModes => ['off', 'heat', 'cool'];

  @override
  Map<String, dynamic> getUpdatedValue(num newSetpoint, String newMode) =>
    {
      'setpoint': newSetpoint.round(),
      'mode': newMode
    };
}