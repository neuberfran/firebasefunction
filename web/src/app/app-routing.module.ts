
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from "./login.component";
import { DevicesComponent } from './devices.component';
import { AuthGuard } from "./auth.guard";
import { LinkAccountComponent } from "./link.component";
import { LinkGuard } from './link.guard';
import { ErrorComponent } from './error.component';

const routes: Routes = [
  {path:'', redirectTo: 'devices', pathMatch: 'full' },
  {path:'login', component:LoginComponent },
  {path:'devices', component:DevicesComponent, canActivate:[AuthGuard] },
  {path:'link-account', component:LinkAccountComponent, canActivate:[LinkGuard] },
  {path:'error', component:ErrorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
