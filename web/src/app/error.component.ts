
import { Component } from '@angular/core';

@Component({
  selector: 'app-error',
  template: `
    <div style="text-align:center;">
      <h1>Account Linking Error</h1>
      <p>We were unable to link your account with the Google Assistant.</p>
    </div>
  `,
  styles: []
})
export class ErrorComponent {}
