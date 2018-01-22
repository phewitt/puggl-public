import { Component, OnInit } from '@angular/core';
import {LoadingServiceProvider} from "../../providers/loading-service";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {FirebaseService} from "../../providers/firebase.service";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  stats = {
    contactsAdded: 0,
    todosAdded: 0,
    emailsSent: 0,
    emailViews: 0
  };

  constructor(
    private loading: LoadingServiceProvider,
    private gcf: GCFMiddlewareService,
    private fb: FirebaseService
  ) { }

  ngOnInit() {
    this.gcf.getHomePageStats().toPromise().then((stats:any) => {
      this.stats = stats;
    });

  }

  showLoading() {
    this.loading.showLoading();
  }
}
