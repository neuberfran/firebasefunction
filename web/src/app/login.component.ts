
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from "firebase/app";

@Component({
  selector: 'app-login',
  template: `
    <div style="text-align:center;">
      <h1>Smart Home Device Manager</h1>
      <p>Sign in with your Google account to view and manage your IoT devices.</p>
      <button (click)="login()" mat-raised-button>
        Sign in with Google
      </button>
    </div>
  `,
  styles: []
})
export class LoginComponent implements OnInit {

  constructor(private authService: AngularFireAuth,
    private router: Router) { }

  ngOnInit() {
    // Redirect only on successful login
    this.authService.authState.subscribe((user) => {
      if (user) {
        this.router.navigate(['devices']);
      }
    });
  }

  login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    this.authService.auth.signInWithRedirect(provider);
  }
}
