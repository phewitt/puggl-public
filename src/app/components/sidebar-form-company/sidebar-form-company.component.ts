import { Component, OnInit } from '@angular/core';
import {Company} from "../../models/company";
import {FirebaseService} from "../../providers/firebase.service";
import {LoadingServiceProvider} from "../../providers/loading-service";
import {Address} from "../../models/address";
import {isNullOrUndefined, isUndefined} from "util";
import {SettingsService} from "../../core/settings/settings.service";
import {MenuItem} from "primeng/primeng";
import {Person} from "../../models/person";
import {Location} from "../../models/location";
import {ParentCompany} from "../../models/parent-company";
import {SidebarServiceService} from "../../providers/sidebar-service.service";
import {Lead} from "../../models/lead";

declare var $: any;
import * as localforage from "localforage";

@Component({
  selector: 'sidebar-form-company',
  templateUrl: './sidebar-form-company.component.html',
  styleUrls: ['./sidebar-form-company.component.scss']
})
export class SidebarFormCompanyComponent implements OnInit {
  company = new Company();
  companiesCache: any;
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
  origLocations = {
    orig: [],
    add: [],
    remove: []
  };

  items: MenuItem[];

  radioModel: string = 'warm';

  constructor(
    public fb: FirebaseService,
    private loading: LoadingServiceProvider,
    private settings: SettingsService,
    private sbService: SidebarServiceService
  ) { }

  ngOnInit() {
    this.items = [
      {label: 'Add New Person', icon: 'fa-users', command: () => {
        this.submit('people');
      }},
      {label: 'Add New Location', icon: 'fa-briefcase', command: () => {
        this.submit('locations');
      }},
      {label: 'Add New Parent Company', icon: 'fa-diamond', command: () => {
        this.submit('parent-companies');
      }},
    ];
    localforage.getItem('companies').then((companies:any) => {
      this.companiesCache = companies;
    });

    if(isNullOrUndefined(this.fb.sidebarData.peopleKeys)) {
      this.fb.sidebarData.peopleKeys = [];
    }
    if(isNullOrUndefined(this.fb.sidebarData.parentCompanyKeys)) {
      this.fb.sidebarData.parentCompanyKeys = [];
    }
    if(isNullOrUndefined(this.fb.sidebarData.locationKeys)) {
      this.fb.sidebarData.locationKeys = [];
    }
    if(isNullOrUndefined(this.fb.sidebarData.leadStatus)) {
      this.fb.sidebarData.leadStatus = '';
    }
    this.origPeople.orig = this.fb.sidebarData.peopleKeys;
    this.origParentCompanies.orig = this.fb.sidebarData.parentCompanyKeys;
    this.origLocations.orig = this.fb.sidebarData.locationKeys;
  }

  close() {
    this.settings.layout.offsidebarOpen = false;
    this.fb.sidebarForm = '';
  }

  compareOrigToRemove() {
    for(let item of this.origLocations.orig) {
      if(this.company.locationKeys.indexOf(item) == -1) {
        this.origLocations.remove.push(item);
      }
    }
    for(let item of this.origParentCompanies.orig) {
      if(this.company.parentCompanyKeys.indexOf(item) == -1) {
        this.origParentCompanies.remove.push(item);
      }
    }
    for(let item of this.origPeople.orig) {
      if(this.company.peopleKeys.indexOf(item) == -1) {
        this.origPeople.remove.push(item);
      }
    }
    this.fb.removeItemsArray(this.origPeople.remove, this.company.id, 'people', 'companyKeys');
    this.fb.removeItemsArray(this.origParentCompanies.remove, this.company.id, 'parent_companies', 'companyKeys');
    this.fb.removeItemsArray(this.origLocations.remove, this.company.id, 'locations', 'companyKeys');
  }

  compareOrigToAdd() {
    for(let item of this.company.locationKeys) {
      if(this.origLocations.orig.indexOf(item) == -1) {
        this.origLocations.add.push(item);
      }
    }
    for(let item of this.company.parentCompanyKeys) {
      if(this.origParentCompanies.orig.indexOf(item) == -1) {
        this.origParentCompanies.add.push(item);
      }
    }
    for(let item of this.company.peopleKeys) {
      if(this.origPeople.orig.indexOf(item) == -1) {
        this.origPeople.add.push(item);
      }
    }
    this.fb.addItemsArray(this.origPeople.add, this.company.id, 'people', 'companyKeys');
    this.fb.addItemsArray(this.origParentCompanies.add, this.company.id, 'parent_companies', 'companyKeys');
    this.fb.addItemsArray(this.origLocations.add, this.company.id, 'locations', 'companyKeys');
  }

  addOtherType(id, type) {
    var data:any;
    var typeName:string;

    if(type == 'people') {
      data = new Person();
      data.companyKeys.push(id);
      typeName = 'person';
    }
    else if(type == 'locations') {
      data = new Location();
      data.companyKeys.push(id);
      typeName = 'location';
    }
    else if(type == 'parent-companies') {
      data = new ParentCompany();
      data.companyKeys.push(id);
      typeName = 'parent-company';
    }

    this.sbService.newItem(typeName, data);
  }

  checkForIsLead() {
      let sub = this.fb.getLeadForContact('companies', this.fb.sidebarData.id).subscribe((lead) => {
        sub.unsubscribe();

        if(lead.length != 1) {
          let tmp = new Lead();
          tmp.receiverKey = this.fb.sidebarData.id;
          tmp.receiverType = 'companies';
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

  submit(type = null) {
    if(isUndefined(this.fb.sidebarData.leadStatus)) {
      this.fb.sidebarData.leadStatus = '';
    }
    this.loading.showLoading();
    this.company = this.fb.sidebarData;
    this.fb.error = '';
    if(this.company.name == '') {
      this.loading.hideLoading();
      this.fb.error = "Yo, put a name!";
    }
    else {
      this.company.address = this.fb.sidebarAddress;

      if(this.fb.sidebarIsEdit) {
        this.company.dateUpdated = new Date();
        this.checkForIsLead();
        this.compareOrigToAdd();
        this.compareOrigToRemove();
        this.fb.updateCompany(this.company).then((rt:any) => {
          if(this.fb.cities.indexOf(this.company.address.city) == -1) {
            this.fb.addCity(this.company.address.city);
          }
          this.fb.openSnackBar('Updated Successfuly');
          this.loading.hideLoading();
          this.fb.setCompanyIndex();
          this.fb.sidebarIsEdit = false;
          if(type == null) {
            this.close();
          }
          else {
            this.addOtherType(this.company.id, type);
          }
        })
          .catch((e) => {
            this.fb.error = e;
            this.loading.hideLoading();
          });
      }
      else {
        this.company = JSON.parse(JSON.stringify(this.company));
        this.company.dateAdded = new Date(this.company.dateAdded);
        this.company.dateUpdated = new Date(this.company.dateUpdated);
        this.company.addedBy = this.fb.auth.auth.currentUser.uid;
        this.fb.addNewCompany(this.company).then((rt) => {
          if (this.fb.cities.indexOf(this.company.address.city) == -1) {
            this.fb.addCity(this.company.address.city);
          }
          this.fb.sidebarData.id = rt.id;
          this.checkForIsLead();

          if(this.fb.sidebarIsAdd == true) {
            if(isNullOrUndefined(this.fb.sidebarAddToTypeData.companyKeys)) {
              this.fb.sidebarAddToTypeData.companyKeys = [];
            }
            this.fb.sidebarAddToTypeData.companyKeys.push(rt.id);
            this.fb.updateItem(this.fb.sidebarAddToTypeData, this.fb.sidebarAddToType).then(() => {
              this.fb.error = '';
            }).catch((e) => {
              this.fb.error = e;
              this.loading.hideLoading();
              this.fb.openSnackBar('Error')
            });
          }

          this.fb.addItemsArray(this.company.parentCompanyKeys, rt.id, 'parent_companies', 'companyKeys');
          this.fb.addItemsArray(this.company.locationKeys, rt.id, 'locations', 'companyKeys');
          this.fb.addItemsArray(this.company.peopleKeys, rt.id, 'people', 'companyKeys');
          this.fb.setCompanyIndex();

          this.fb.openSnackBar('Added Successfuly');
          this.loading.hideLoading();
          this.company = new Company();
          this.fb.sidebarAddress = new Address();
          if(type == null) {
            this.close();
          }
          else {
            this.addOtherType(rt.id, type);
          }
        })
          .catch((e) => {
            this.fb.error = e;
            this.loading.hideLoading();
            this.fb.openSnackBar('Error')
          });
      }
    }
  }
}
