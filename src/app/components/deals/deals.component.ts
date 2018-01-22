import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {Deal} from "../../models/deal";
import {SettingsService} from "../../core/settings/settings.service";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {isNullOrUndefined} from "util";

@Component({
  selector: 'deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss']
})
export class DealsComponent implements OnInit, OnChanges {
  @Input() id;
  @Input() type;
  @Input() data;
  @ViewChild('lgModal') lgModal;

  deal = new Deal();

  deals: any;

  constructor(
    public fb: FirebaseService,
    private settings: SettingsService,
    private gcf: GCFMiddlewareService
  ) { }

  ngOnInit() {

  }

  ngOnChanges() {
    if (!isNullOrUndefined(this.data)) {
      this.gcf.getDealsForAType(this.id, this.type).toPromise().then((deals) => {
        this.deals = deals;
      });
    }
  }

  newDeal() {
    this.deal = new Deal();
    this.deal.postedToType = this.type;
    this.deal.postedToKey = this.id;
    this.fb.sidebarData = this.deal;

    this.fb.sidebarIsAdd = true;
    this.fb.sidebarForm = 'deal';
    this.settings.layout.offsidebarOpen = true;
  }

  editDeal(deal) {
    this.deal = deal;
    this.fb.sidebarData = this.deal;

    this.fb.sidebarIsEdit = true;
    this.fb.sidebarForm = 'deal';
    this.settings.layout.offsidebarOpen = true;
  }
}
