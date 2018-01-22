import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {Deal} from "../../models/deal";
import {SettingsService} from "../../core/settings/settings.service";

@Component({
  selector: 'app-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss']
})
export class DealsComponent implements OnInit {
  deals: any;
  deal = new Deal();
  today = new Date();

  monthlyRev = 0;
  onboardingThisMonth = 0;
  onboardingThisYear = 0;
  dealsThisYear = 0;
  dealsThisMonth = 0;

  constructor(
    private gcf: GCFMiddlewareService,
    public fb: FirebaseService,
    private settings: SettingsService
  ) { }

  ngOnInit() {
    this.gcf.getAllDeals().toPromise().then((deals:any) => {
      this.deals = deals;
      for(let deal of deals) {
        if(this.fb.dealStagesIndex[deal['stageKey']] == 'Won') {
          this.monthlyRev += Number(deal.monthlyAmount);
          let numDays = this.numDaysBetween(new Date(this.today), new Date(deal.dateClosed));

          if(numDays <= 30) {
            this.onboardingThisMonth += Number(deal.onboardingAmount);
            this.dealsThisMonth += 1;
          }
          if(numDays <= 365) {
            this.onboardingThisYear += Number(deal.onboardingAmount);
            this.dealsThisYear += 1;
          }
        }
      }
    })
  }

  numDaysBetween(d1, d2) {
    var diff = Math.abs(d1.getTime() - d2.getTime());
    return diff / (1000 * 60 * 60 * 24);
  };

  editDeal(deal) {
    this.deal = deal;
    this.fb.sidebarData = this.deal;

    this.fb.sidebarIsEdit = true;
    this.fb.sidebarForm = 'deal';
    this.settings.layout.offsidebarOpen = true;
  }
}
