
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'device_config.dart';
import 'model.dart';

class DeviceListScreen extends StatefulWidget {
  DeviceListScreen({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _DeviceListState createState() => new _DeviceListState();
}

/// Main UI to view and manage user devices
class _DeviceListState extends State<DeviceListScreen> {
  FirebaseUser _user;

  /// Scan a device, then publish the result
  void _registerDevice(BuildContext context) async {
    final result = await Navigator.pushNamed(context, '/register');
    if (result == null) return;

    // Attach the current user as the device owner
    final Map<String, dynamic> device = result;
    device['owner'] = _user.uid;

    final String deviceId = device['serial_number'];
    var pendingRef = Firestore.instance.collection('pending').document(deviceId);
    pendingRef.setData(device);

    final snackBar = SnackBar(content: Text('Registering $deviceId'));
    Scaffold.of(context).showSnackBar(snackBar);
  }

  /// Show user panel to send a device command
  void _selectDevice(BuildContext context, Device device) {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return DeviceConfigPanel(device: device);
      },
    );
  }

  /// List devices owned by the authenticated user
  Widget _queryDeviceList(FirebaseUser user) {
    if (user == null) {
      return Center(child: CircularProgressIndicator());
    }

    return StreamBuilder<QuerySnapshot>(
        stream: Firestore.instance.collection('devices')
          .where('owner', isEqualTo: user.uid)
          .snapshots(),
        builder: (BuildContext context, AsyncSnapshot<QuerySnapshot> snapshot) {
          if (snapshot.hasError)
            return Text('Error: ${snapshot.error}');
          switch (snapshot.connectionState) {
            case ConnectionState.waiting:
              return Center(child: CircularProgressIndicator());
            default:
              return ListView(
                children: snapshot.data.documents.map((DocumentSnapshot data) {
                  Device device = Device.fromData(data.data, data.documentID);
                  return ListTile(
                    title: Text(device.name),
                    subtitle: Text(device.deviceStatus),
                    leading: Icon(device.deviceIcon),
                    onTap: () => _selectDevice(context, device),
                  );
                }).toList(),
              );
          }
        },
      );
  }

  @override
  void initState() {
    super.initState();
    // Update state once current user is retrieved
    FirebaseAuth.instance.currentUser().then((FirebaseUser user) {
      setState(() {
        _user = user;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: _queryDeviceList(_user),
      floatingActionButton: Builder(
        builder: (context) => FloatingActionButton(
          onPressed: () => _registerDevice(context),
          tooltip: 'Register Device',
          child: Icon(Icons.add),
        ),
      ),
    );
  }
}
