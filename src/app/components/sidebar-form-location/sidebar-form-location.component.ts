import { Component, OnInit } from '@angular/core';
import {Location} from "../../models/location";
import {FirebaseService} from "../../providers/firebase.service";
import {LoadingServiceProvider} from "../../providers/loading-service";
import {Address} from "../../models/address";
import {isNullOrUndefined, isUndefined} from "util";
import {SettingsService} from "../../core/settings/settings.service";
import {Observable} from "rxjs/Observable";
import {Lead} from "../../models/lead";

declare var $: any;

@Component({
  selector: 'sidebar-form-location',
  templateUrl: './sidebar-form-location.component.html',
  styleUrls: ['./sidebar-form-location.component.scss']
})
export class SidebarFormLocationComponent implements OnInit {
  location = new Location();

  origPeople = {
    orig: [],
    add: [],
    remove: []
  };
  origParentCompanies = {
    orig: [],
    add: [],
    remove: []
  };
  origCompanies = {
    orig: [],
    add: [],
    remove: []
  };

  constructor(
    public fb: FirebaseService,
    private loading: LoadingServiceProvider,
    private settings: SettingsService
  ) { }

  ngOnInit() {
    if(isNullOrUndefined(this.fb.sidebarData.peopleKeys)) {
      this.fb.sidebarData.peopleKeys = [];
    }
    if(isNullOrUndefined(this.fb.sidebarData.parentCompanyKeys)) {
      this.fb.sidebarData.parentCompanyKeys = [];
    }
    if(isNullOrUndefined(this.fb.sidebarData.companyKeys)) {
      this.fb.sidebarData.companyKeys = [];
    }
    this.origPeople.orig = this.fb.sidebarData.peopleKeys;
    this.origParentCompanies.orig = this.fb.sidebarData.parentCompanyKeys;
    this.origCompanies.orig = this.fb.sidebarData.companyKeys;
  }

  close() {
    this.settings.layout.offsidebarOpen = false;
    this.fb.sidebarForm = '';
    // $('#app-root').removeClass('offsidebar-open');
  }

  compareOrigToRemove() {
    for(let item of this.origCompanies.orig) {
      if(this.location.companyKeys.indexOf(item) == -1) {
        this.origCompanies.remove.push(item);
      }
    }
    for(let item of this.origParentCompanies.orig) {
      if(this.location.parentCompanyKeys.indexOf(item) == -1) {
        this.origParentCompanies.remove.push(item);
      }
    }
    for(let item of this.origPeople.orig) {
      if(this.location.peopleKeys.indexOf(item) == -1) {
        this.origPeople.remove.push(item);
      }
    }
    this.fb.removeItemsArray(this.origPeople.remove, this.location.id, 'people', 'locationKeys');
    this.fb.removeItemsArray(this.origParentCompanies.remove, this.location.id, 'parent_companies', 'locationKeys');
    this.fb.removeItemsArray(this.origCompanies.remove, this.location.id, 'companies', 'locationKeys');
  }

  compareOrigToAdd() {
    for(let item of this.location.companyKeys) {
      if(this.origCompanies.orig.indexOf(item) == -1) {
        this.origCompanies.add.push(item);
      }
    }
    for(let item of this.location.parentCompanyKeys) {
      if(this.origParentCompanies.orig.indexOf(item) == -1) {
        this.origParentCompanies.add.push(item);
      }
    }
    for(let item of this.location.peopleKeys) {
      if(this.origPeople.orig.indexOf(item) == -1) {
        this.origPeople.add.push(item);
      }
    }
    this.fb.addItemsArray(this.origPeople.add, this.location.id, 'people', 'locationKeys');
    this.fb.addItemsArray(this.origParentCompanies.add, this.location.id, 'parent_companies', 'locationKeys');
    this.fb.addItemsArray(this.origCompanies.add, this.location.id, 'companies', 'locationKeys');
  }

  checkForIsLead() {
      let sub = this.fb.getLeadForContact('locations', this.fb.sidebarData.id).subscribe((lead) => {
        sub.unsubscribe();

        if(lead.length != 1) {
          let tmp = new Lead();
          tmp.receiverKey = this.fb.sidebarData.id;
          tmp.receiverType = 'locations';
          tmp.leadType = this.fb.sidebarData.leadStatus;
          tmp.addedBy = this.fb.uid;
          this.fb.addLead(tmp);
        }
        else {
          let tmp = lead[0].payload.doc.data();
          tmp.id = lead[0].payload.doc.id;
          tmp.leadType = this.fb.sidebarData.leadStatus;
          this.fb.updateLead(tmp);
        }
      });
  }

  submit() {
    if(isUndefined(this.fb.sidebarData.leadStatus)) {
      this.fb.sidebarData.leadStatus = '';
    }
    this.loading.showLoading();
    this.location = this.fb.sidebarData;
    this.fb.error = '';
    if(this.location.name == '') {
      this.loading.hideLoading();
      this.fb.error = "Yo, put a name!";
    }
    else {
      this.location.address = this.fb.sidebarAddress;

      if(this.fb.sidebarIsEdit) {
        this.location.dateUpdated = new Date();
        this.checkForIsLead();
        this.compareOrigToAdd();
        this.compareOrigToRemove();
        this.fb.updateLocation(this.location).then((rt) => {
          if(this.fb.cities.indexOf(this.location.address.city) == -1) {
            this.fb.addCity(this.location.address.city);
          }
          this.loading.hideLoading();
          this.fb.sidebarIsEdit = false;
          this.close();
          this.fb.setLocationIndex();
          this.fb.openSnackBar('Added Successfully');
          this.fb.error = '';
        })
          .catch((e) => {
            this.fb.error = e;
            this.loading.hideLoading();
          });

      }
      else {
        this.location = JSON.parse(JSON.stringify(this.location));
        this.location.dateAdded = new Date(this.location.dateAdded);
        this.location.dateUpdated = new Date(this.location.dateUpdated);
        this.location.addedBy = this.fb.auth.auth.currentUser.uid;
        this.fb.addNewLocation(this.location).then((rt) => {
          if (this.fb.cities.indexOf(this.location.address.city) == -1) {
            this.fb.addCity(this.location.address.city);
          }
          this.fb.sidebarData.id = rt.id;
          this.checkForIsLead();
          if(this.fb.sidebarIsAdd == true) {
            if(isNullOrUndefined(this.fb.sidebarAddToTypeData.locationKeys)) {
              this.fb.sidebarAddToTypeData.locationKeys = [];
            }
            this.fb.sidebarAddToTypeData.locationKeys.push(rt.id);
            this.fb.updateItem(this.fb.sidebarAddToTypeData, this.fb.sidebarAddToType).then(() => {
            }).catch((e) => {
              this.fb.error = e;
              this.loading.hideLoading();
              this.fb.openSnackBar('Error')
            });
          }

          this.fb.addItemsArray(this.location.parentCompanyKeys, rt.id, 'parent_companies', 'locationKeys');
          this.fb.addItemsArray(this.location.companyKeys, rt.id, 'companies', 'locationKeys');
          this.fb.addItemsArray(this.location.peopleKeys, rt.id, 'people', 'locationKeys');

          this.fb.openSnackBar('Added Successfully');
          this.fb.setLocationIndex();

          this.loading.hideLoading();
          this.location = new Location();
          this.fb.sidebarAddress = new Address();
          this.close();
        })
          .catch((e) => {
            this.fb.error = e;
            this.loading.hideLoading();
          });
      }
    }
  }

}
