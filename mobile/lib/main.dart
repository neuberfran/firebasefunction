import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'login.dart';
import 'devices.dart';
import 'register.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  runApp(DeviceManagerApp());
}

class DeviceManagerApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Device Manager',
      // Start the app at the login screen
      initialRoute: '/',
      routes: {
        '/': (context) => LoginScreen(title: 'Login'),
        '/devices': (context) => DeviceListScreen(title: 'Registered Devices'),
        '/register': (context) => RegisterDeviceScreen(title: 'Add New Device'),
      },
    );
  }
}
