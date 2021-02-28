
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AngularFireAuth, private router: Router) { }

  canActivate(): Observable<boolean> {
      return this.authService.authState.pipe(map(user => {
        if (user == null) {
          this.router.navigate(['login']);
          return false;
        }

        return true;
      }));
  }
}
