import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar>
      <span>{{ title }}</span>
      <span class="spacer"></span>
      <button *ngIf="authService.authState | async as user" (click)="logout()" mat-icon-button>
        <mat-icon aria-label="Log out">exit_to_app</mat-icon>
      </button>
    </mat-toolbar>
    <div>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'Device Manager';

  constructor(public authService: AngularFireAuth,
    private router: Router) { }

  logout() {
    this.authService.auth.signOut().then(() => {
      this.router.navigate(['login']);
    });
  }
}
