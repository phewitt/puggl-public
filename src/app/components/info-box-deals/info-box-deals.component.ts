import { Component, OnInit } from '@angular/core';
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {FirebaseService} from "../../providers/firebase.service";
import {Deal} from "../../models/deal";
import {SettingsService} from "../../core/settings/settings.service";

@Component({
  selector: 'info-box-deals',
  templateUrl: './info-box-deals.component.html',
  styleUrls: ['./info-box-deals.component.scss']
})
export class InfoBoxDealsComponent implements OnInit {
  deals: any;
  deal = new Deal();

  constructor(
    private gcf: GCFMiddlewareService,
    public fb: FirebaseService,
    private settings: SettingsService
  ) { }

  ngOnInit() {
    this.gcf.getRecentDeals().toPromise().then((deals) => {
      this.deals = deals;
    })
  }


}
