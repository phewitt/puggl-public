import { Component, OnInit } from '@angular/core';
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {FirebaseService} from "../../providers/firebase.service";

@Component({
  selector: 'info-box-recent-email-views',
  templateUrl: './info-box-recent-email-views.component.html',
  styleUrls: ['./info-box-recent-email-views.component.scss']
})
export class InfoBoxRecentEmailViewsComponent implements OnInit {
  recentEmailViews: any;

  constructor(
    public gcf: GCFMiddlewareService,
    public fb: FirebaseService
  ) { }

  ngOnInit() {
    this.gcf.getRecentEmailsViewsThisWeek().toPromise().then((views) => {
      this.recentEmailViews = views;
    });
  }

}
