import { Component, OnInit } from '@angular/core';
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {FirebaseService} from "../../providers/firebase.service";

@Component({
  selector: 'info-box-account-executive',
  templateUrl: './info-box-account-executive.component.html',
  styleUrls: ['./info-box-account-executive.component.scss']
})
export class InfoBoxAccountExecutiveComponent implements OnInit {
  accounts: any;

  constructor(
    public gcf: GCFMiddlewareService,
    public fb: FirebaseService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.gcf.getItemsForAccountExecutive(this.fb.auth.auth.currentUser.uid).toPromise().then((views) => {
        this.accounts = views;
      });
    }, 500);
  }

}
