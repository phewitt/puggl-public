import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {SettingsService} from "../../core/settings/settings.service";
import {BsDatepickerConfig} from "ngx-bootstrap/datepicker";
import {Deal} from "../../models/deal";
import {LoadingServiceProvider} from "../../providers/loading-service";
import {isNullOrUndefined} from "util";

const swal = require('sweetalert');

@Component({
  selector: 'sidebar-form-deal',
  templateUrl: './sidebar-form-deal.component.html',
  styleUrls: ['./sidebar-form-deal.component.scss']
})
export class SidebarFormDealComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  statusArray = [
    {name: 'Green', value: 'green', hex: '#4CAF50'},
    {name: 'Yellow', value: 'yellow', hex: '#FFEB3B'},
    {name: 'Red', value: 'red', hex: '#EF5350'},
  ];
  deal: Deal;
  item: any;

  constructor(
    public fb: FirebaseService,
    private settings: SettingsService,
    private loading: LoadingServiceProvider,
  ) { }

  ngOnInit() {
    this.fb.getItem(this.fb.sidebarData.postedToKey, this.fb.sidebarData.postedToType).snapshotChanges().map(a => {
      const data = a.payload.data();
      const id = a.payload.id;
      return { id, ...data };
    }).subscribe((item:any) => {
      this.item = item;
    });
    this.bsConfig = Object.assign({}, { containerClass: 'theme-dark-blue', showWeekNumbers: false});
  }

  close() {
    this.settings.layout.offsidebarOpen = false;
    this.fb.sidebarForm = '';
    // $('#app-root').removeClass('offsidebar-open');
  }

  addAddOn() {
    let newAddOn = {
      name: '', price: ''
    };
    if(isNullOrUndefined(this.fb.sidebarData.addOns)) {
      this.fb.sidebarData.addOns = [];
    }
    this.fb.sidebarData.addOns.push(newAddOn);
  }

  removeAddOn(index) {
    this.fb.sidebarData.addOns.splice(index, 0);
  }

  submit() {
    this.loading.showLoading();
    this.deal = this.fb.sidebarData;
    this.fb.error = '';
    if (this.deal.name == '') {
      this.loading.hideLoading();
      this.fb.error = "Yo, put a name!";
    }
    else {
      if(this.fb.sidebarIsEdit) {
        this.deal.dateUpdated = new Date();
        if(this.fb.dealStagesIndex[this.deal.stageKey] == 'Won' && this.item.isCustomer != true) {
          this.deal.dateClosed = new Date();
          swal({
            title: 'Do you want to convert this company to a customer?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#607d8b',
            confirmButtonText: 'Yes',
            closeOnConfirm: true
          }, () => {
            this.makeCustomer();
          });
        }
        this.fb.updateDeal(this.deal).then((rt) => {
          this.fb.openSnackBar('Updated Successfuly');
          this.loading.hideLoading();
          this.fb.setCompanyIndex();
          this.fb.sidebarIsEdit = false;
          this.close();
        })
          .catch((e) => {
            this.fb.error = e;
            this.loading.hideLoading();
          });
      }
      else {
        this.deal = JSON.parse(JSON.stringify(this.deal));
        this.deal.dateUpdated = new Date();
        this.deal.dateAdded = new Date();
        this.deal.expectedClose = new Date(this.deal.expectedClose);
        if(this.fb.dealStagesIndex[this.deal.stageKey] == 'Won') {
          this.deal.dateClosed = new Date();
        }
        this.fb.addNewDeal(this.deal).then((rt) => {
          this.loading.hideLoading();
          this.close();
        });
      }
    }
  }

  makeCustomer() {
      this.item.isCustomer = true;
      this.fb.updateItem(this.item, this.deal.postedToType);
  }
}
