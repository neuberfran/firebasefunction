
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:firebase_auth/firebase_auth.dart';

class LoginScreen extends StatefulWidget {
  LoginScreen({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _LoginState createState() => new _LoginState();
}


/// Authenticate the user with Firebase
class _LoginState extends State<LoginScreen> {
  bool _isLoading = false;

  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final FirebaseAuth _auth = FirebaseAuth.instance;

  /// Ask the user to sign in
  void _handleLogin(BuildContext context) async {
    setState(() { _isLoading = true; });
    try {
      GoogleSignInAccount googleUser = await _googleSignIn.signIn();
      GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final AuthCredential credential = GoogleAuthProvider.getCredential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );
      await _auth.signInWithCredential(credential);

      // Navigate forward on successful login
      Navigator.pushReplacementNamed(context, '/devices');
    } catch (error) {
      print(error);

      final snackBar = SnackBar(content: Text('Unable to sign in'));
      Scaffold.of(context).showSnackBar(snackBar);
    }
    setState(() { _isLoading = false; });
  }

  @override
  Widget build(BuildContext context) {
    TextTheme textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Stack(
          children: <Widget>[
            Align(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text('Smart Home Device Manager',
                    style: textTheme.title,
                    textAlign: TextAlign.center,
                  ),
                  Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Text('Sign in with your Google account to view and manage your IoT devices.',
                      style: textTheme.subtitle,
                      textAlign: TextAlign.center,
                    ),
                  ),
                  Builder(
                      builder: (context) => RaisedButton(
                        child: const Text('Sign in with Google'),
                        onPressed: () => _handleLogin(context),
                      ),
                    ),
                ]
              ),
              alignment: Alignment.center,
            ),
            Align(
              child: _isLoading ? CircularProgressIndicator() : null,
              alignment: Alignment.bottomCenter,
            )
          ],
        ),
      ),
    );
  }
}