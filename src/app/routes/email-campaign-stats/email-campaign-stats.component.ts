import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {FirebaseService} from "../../providers/firebase.service";
import {EmailCampaign} from "../../models/email-campaign";
import {isNullOrUndefined} from "util";
import {Observable} from "rxjs/Observable";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {LoadingServiceProvider} from "../../providers/loading-service";

@Component({
  selector: 'app-email-campaign-stats',
  templateUrl: './email-campaign-stats.component.html',
  styleUrls: ['./email-campaign-stats.component.scss']
})
export class EmailCampaignStatsComponent implements OnInit {
  emailCampaignKey:string;
  emailCampaign = new EmailCampaign();

  emailTrackers: Observable<any>;

  mostClickedIndex = {};
  mostClickedKeys = [];

  mostViewedUserIndex = {};
  mostViewedUserKeys = [];

  viewIndex = {};
  individualViewCount = 0;

  constructor(
    private route: ActivatedRoute,
    public fb: FirebaseService,
    private gcf: GCFMiddlewareService,
    private loading: LoadingServiceProvider
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.emailCampaignKey = params['emailCampaignKey'];
      this.emailCampaign = new EmailCampaign();
      let sub = this.fb.getEmailCampaign(this.emailCampaignKey).subscribe((emailCampaign: any) => {
        this.emailCampaign = emailCampaign;
        this.emailTrackers = this.fb.getEmailTrackers(this.emailCampaignKey);

        this.emailCampaign.views.subscribe((views) => {
          this.viewIndex = {};
          this.individualViewCount = 0;
          for(let view of views) {
            if(isNullOrUndefined(this.viewIndex[view.receiverKey])) {
              this.viewIndex[view.receiverKey] = 1;
              this.individualViewCount++;
            }
            else {
              this.viewIndex[view.receiverKey]++;
            }
          }
        });

        this.emailCampaign.shortUrlClicks.subscribe((clicks) => {
          this.mostClickedIndex = {};
          for(let click of clicks) {
            if(isNullOrUndefined(this.mostClickedIndex[click.url])) {
              this.mostClickedIndex[click.url] = 1;
            }
            else {
              this.mostClickedIndex[click.url]++;
            }
          }
          this.mostClickedKeys = [];
          for(let click in this.mostClickedIndex) {
            this.mostClickedKeys.push([click, this.mostClickedIndex[click]])
          }
          this.mostClickedKeys.sort(function(a, b) {
            return  b[1] - a[1];
          });
        });


        this.emailCampaign.emailTrackerViewKeys.subscribe((views) => {
          this.mostViewedUserIndex = {};
          for(let view of views) {
            if(isNullOrUndefined(this.mostViewedUserIndex[view.receiverKey])) {
              this.mostViewedUserIndex[view.receiverKey] = {
                count: 1,
                type: view.receiverType
              };
            }
            else {
              this.mostViewedUserIndex[view.receiverKey].count++;
            }
          }
          this.mostViewedUserKeys = [];
          for(let view in this.mostViewedUserIndex) {
            this.mostViewedUserKeys.push([view, this.mostViewedUserIndex[view].count, this.mostViewedUserIndex[view].type]);
          }
          this.mostViewedUserKeys.sort(function(a, b) {
            return b[1] - a[1];
          });
        });



        sub.unsubscribe();
      });
    });
  }

  resendEmail(emailTrackerKey) {
    this.loading.showLoading();
    this.gcf.resendEmail(emailTrackerKey).toPromise().then((d) => {
      this.loading.hideLoading();
      this.fb.openSnackBar('Email resent successfully');
    }).catch(() => {
      this.loading.hideLoading();
      this.fb.openSnackBar('Error');
    });
  }

}
