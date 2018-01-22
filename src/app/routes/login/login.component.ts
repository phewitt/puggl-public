import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {FirebaseService} from "../../providers/firebase.service";
import {LoadingServiceProvider} from "../../providers/loading-service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public email: string;
  public password: string;
  public error: any;

  constructor(
    public fb: FirebaseService,
    public router: Router,
    private loading: LoadingServiceProvider
  ) {}

  ngOnInit() {
  }

  loginUser(event){
    event.preventDefault();
    this.loading.showLoading();

    this.fb.loginUser(this.email, this.password)
      .then((userData) => {
        console.log(userData)
        this.fb.uid = userData.uid;
        this.router.navigate(['']);
        this.loading.hideLoading();

      })
      .catch((error: any) => {
        if (error) {
          this.loading.hideLoading();
          this.error = error;
        }
      });
  }
}
