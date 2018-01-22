import {Component, OnInit} from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {ParentCompany} from "../../models/parent-company";
import {LoadingServiceProvider} from "../../providers/loading-service";
import {SettingsService} from "../../core/settings/settings.service";
import {isNullOrUndefined, isUndefined} from "util";
import {Observable} from "rxjs/Observable";
import {Lead} from "../../models/lead";

declare var $: any;

@Component({
  selector: 'sidebar-form-parent-company',
  templateUrl: './sidebar-form-parent-company.component.html',
  styleUrls: ['./sidebar-form-parent-company.component.scss']
})
export class SidebarFormParentCompanyComponent implements OnInit {
  parentCompany: ParentCompany;

  origPeople = {
    orig: [],
    add: [],
    remove: []
  };
  origLocations = {
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
    if(isNullOrUndefined(this.fb.sidebarData.locationKeys)) {
      this.fb.sidebarData.locationKeys = [];
    }
    if(isNullOrUndefined(this.fb.sidebarData.companyKeys)) {
      this.fb.sidebarData.companyKeys = [];
    }
    this.origPeople.orig = this.fb.sidebarData.peopleKeys;
    this.origLocations.orig = this.fb.sidebarData.locationKeys;
    this.origCompanies.orig = this.fb.sidebarData.companyKeys;
  }

  close() {
    this.settings.layout.offsidebarOpen = false;
    this.fb.sidebarForm = '';
    // $('#app-root').removeClass('offsidebar-open');
  }

  compareOrigToRemove() {
    for(let item of this.origCompanies.orig) {
      if(this.parentCompany.companyKeys.indexOf(item) == -1) {
        this.origCompanies.remove.push(item);
      }
    }
    for(let item of this.origLocations.orig) {
      if(this.parentCompany.locationKeys.indexOf(item) == -1) {
        this.origLocations.remove.push(item);
      }
    }
    for(let item of this.origPeople.orig) {
      if(this.parentCompany.peopleKeys.indexOf(item) == -1) {
        this.origPeople.remove.push(item);
      }
    }
    this.fb.removeItemsArray(this.origPeople.remove, this.parentCompany.id, 'people', 'parentCompanyKeys');
    this.fb.removeItemsArray(this.origLocations.remove, this.parentCompany.id, 'locations', 'parentCompanyKeys');
    this.fb.removeItemsArray(this.origCompanies.remove, this.parentCompany.id, 'companies', 'parentCompanyKeys');
  }

  compareOrigToAdd() {
    for(let item of this.parentCompany.companyKeys) {
      if(this.origCompanies.orig.indexOf(item) == -1) {
        this.origCompanies.add.push(item);
      }
    }
    for(let item of this.parentCompany.locationKeys) {
      if(this.origLocations.orig.indexOf(item) == -1) {
        this.origLocations.add.push(item);
      }
    }
    for(let item of this.parentCompany.peopleKeys) {
      if(this.origPeople.orig.indexOf(item) == -1) {
        this.origPeople.add.push(item);
      }
    }
    this.fb.addItemsArray(this.origPeople.add, this.parentCompany.id, 'people', 'parentCompanyKeys');
    this.fb.addItemsArray(this.origLocations.add, this.parentCompany.id, 'locations', 'parentCompanyKeys');
    this.fb.addItemsArray(this.origCompanies.add, this.parentCompany.id, 'companies', 'parentCompanyKeys');
  }

  checkForIsLead() {
      let sub = this.fb.getLeadForContact('parent_companies', this.fb.sidebarData.id).subscribe((lead) => {
        console.log(lead);
        sub.unsubscribe();

        if(lead.length != 1) {
          let tmp = new Lead();
          tmp.receiverKey = this.fb.sidebarData.id;
          tmp.receiverType = 'parent_companies';
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
    this.fb.error = '';
    this.parentCompany = this.fb.sidebarData;
    if(this.parentCompany.name == '') {
      this.loading.hideLoading();
      this.fb.error = "Yo, put a name!";
    }
    else {
      this.parentCompany.address = this.fb.sidebarAddress;

      if(this.fb.sidebarIsEdit) {
        this.parentCompany.dateUpdated = new Date();
        this.checkForIsLead();
        this.compareOrigToAdd();
        this.compareOrigToRemove();
        this.fb.updateParentCompany(this.parentCompany).then((rt) => {
          if(this.fb.cities.indexOf(this.parentCompany.address.city) == -1) {
            this.fb.addCity(this.parentCompany.address.city);
          }
          this.loading.hideLoading();
          this.fb.error = '';
          this.fb.openSnackBar('Added Successfully');
          this.fb.sidebarIsEdit = false;
          this.fb.setParentCompanyIndex();
          this.close();
        })
          .catch((e) => {
            this.fb.error = e;
            this.loading.hideLoading();
          });
      }
      else {
        this.parentCompany = JSON.parse(JSON.stringify(this.parentCompany));
        this.parentCompany.dateAdded = new Date(this.parentCompany.dateAdded);
        this.parentCompany.dateUpdated = new Date(this.parentCompany.dateUpdated);
        this.parentCompany.addedBy = this.fb.auth.auth.currentUser.uid;
        this.fb.addNewParentCompany(this.parentCompany).then((rt) => {
          if(this.fb.cities.indexOf(this.parentCompany.address.city) == -1) {
            this.fb.addCity(this.parentCompany.address.city);
          }
          this.fb.sidebarData.id = rt.id;
          this.checkForIsLead();

          if(this.fb.sidebarIsAdd == true) {
            if(isNullOrUndefined(this.fb.sidebarAddToTypeData.parentCompanyKeys)) {
              this.fb.sidebarAddToTypeData.parentCompanyKeys = [];
            }
            this.fb.sidebarAddToTypeData.parentCompanyKeys.push(rt.id);
            this.fb.updateItem(this.fb.sidebarAddToTypeData, this.fb.sidebarAddToType).then(() => {
            }).catch((e) => {
              this.fb.error = e;
              this.loading.hideLoading();
              this.fb.openSnackBar('Error')
            });
          }

          this.fb.addItemsArray(this.parentCompany.companyKeys, rt.id, 'companies', 'parentCompanyKeys');
          this.fb.addItemsArray(this.parentCompany.locationKeys, rt.id, 'locations', 'parentCompanyKeys');
          this.fb.addItemsArray(this.parentCompany.peopleKeys, rt.id, 'people', 'parentCompanyKeys');

          this.fb.openSnackBar('Added Successfully');
          this.fb.setParentCompanyIndex();

          this.loading.hideLoading();
          this.fb.sidebarIsEdit = false;
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
