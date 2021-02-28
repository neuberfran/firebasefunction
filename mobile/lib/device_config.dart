import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'model.dart';

class DeviceConfigPanel extends StatefulWidget {
  DeviceConfigPanel({Key key, this.device}) : super(key: key);

  final Device device;

  @override
  _DeviceConfigState createState() => new _DeviceConfigState();
}

/// Send a state change command to the selected device
class _DeviceConfigState extends State<DeviceConfigPanel> {

  num _configSetpoint;
  String _configMode;

  /// Write the selected values into Firestore device config
  void _updateDeviceConfig() {
    final DocumentReference configRef = Firestore.instance.collection('device-configs')
      .document(widget.device.id);

    configRef.updateData({
      'value': widget.device.getUpdatedValue(_configSetpoint, _configMode)
    });
  }

  @override
  void initState() {
    super.initState();
    _configSetpoint = widget.device.setpoint;
    _configMode =widget.device.mode;
  }

  @override
  Widget build(BuildContext context) {
    TextTheme textTheme = Theme.of(context).textTheme;

    return Padding(
      padding: EdgeInsets.all(8.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(widget.device.name,
            style: textTheme.title),
          Text(widget.device.id,
            style: textTheme.subtitle),
          DropdownButton<String>(
            value: _configMode,
            items: widget.device.availableModes
              .map<DropdownMenuItem<String>>((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(value.toUpperCase()),
                );
              })
              .toList(),
            onChanged: (newValue) {
              setState(() {
                _configMode = newValue;
              });
            },
          ),
          Slider(
            value: _configSetpoint.toDouble(),
            min: widget.device.minSetpoint,
            max: widget.device.maxSetpoint,
            divisions: (widget.device.maxSetpoint - widget.device.minSetpoint).round(),
            label: "${_configSetpoint.round()}",
            onChanged: (newValue) {
              setState(() {
                _configSetpoint = newValue;
              });
            },
          ),
          Align(
            alignment: Alignment.bottomRight,
            child: FlatButton(
              child: const Text('Send Command'),
              onPressed: () {
                _updateDeviceConfig();
                Navigator.pop(context);
              },
            ),
          ),
        ],
      ),
    );
  }
}
