import { NgModule } from '@angular/core';
import { LoginComponent } from './login.component';
import { Routes, RouterModule } from '@angular/router';
import {SharedModule} from "../../shared/shared.module";

const routes: Routes = [
  { path: '', component: LoginComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ],
  // declarations: [LoginComponent],
  exports: [
    RouterModule
  ]
})
export class LoginModule { }
