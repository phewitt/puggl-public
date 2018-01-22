import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {LoadingServiceProvider} from "../../providers/loading-service";
import {Address} from "../../models/address";
import {Person} from "../../models/person";
import {isNullOrUndefined, isUndefined} from "util";
import {SettingsService} from "../../core/settings/settings.service";
import {Lead} from "../../models/lead";

declare var $: any;

@Component({
  selector: 'sidebar-form-person',
  templateUrl: './sidebar-form-person.component.html',
  styleUrls: ['./sidebar-form-person.component.scss']
})
export class SidebarFormPersonComponent implements OnInit, AfterViewInit {
  person = new Person();

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
  origCompanies = {
    orig: [],
    add: [],
    remove: []
  };

  locations = [];
  companies = [];
  parentCompanies = [];

  constructor(
    public fb: FirebaseService,
    private loading: LoadingServiceProvider,
    private settings: SettingsService
  ) { }

  ngOnInit() {

    if(isNullOrUndefined(this.fb.sidebarData.parentCompanyKeys)) {
      this.fb.sidebarData.parentCompanyKeys = [];
    }
    if(isNullOrUndefined(this.fb.sidebarData.locationKeys)) {
      this.fb.sidebarData.locationKeys = [];
    }
    if(isNullOrUndefined(this.fb.sidebarData.companyKeys)) {
      this.fb.sidebarData.companyKeys = [];
    }
    this.origParentCompanies.orig = this.fb.sidebarData.parentCompanyKeys;
    this.origLocations.orig = this.fb.sidebarData.locationKeys;
    this.origCompanies.orig = this.fb.sidebarData.companyKeys;
  }

  ngAfterViewInit() {
    this.locations = this.fb.locationsNameArray;
    this.companies = this.fb.companiesNameArray;
    this.parentCompanies = this.fb.parentCompaniesNameArray;
  }

  close() {
    this.settings.layout.offsidebarOpen = false;
    this.fb.sidebarForm = '';
    // $('#app-root').removeClass('offsidebar-open');
  }

  compareOrigToRemove() {
    for(let item of this.origCompanies.orig) {
      if(this.person.companyKeys.indexOf(item) == -1) {
        this.origCompanies.remove.push(item);
      }
    }
    for(let item of this.origLocations.orig) {
      if(this.person.locationKeys.indexOf(item) == -1) {
        this.origLocations.remove.push(item);
      }
    }
    for(let item of this.origParentCompanies.orig) {
      if(this.person.parentCompanyKeys.indexOf(item) == -1) {
        this.origParentCompanies.remove.push(item);
      }
    }
    this.fb.removeItemsArray(this.origParentCompanies.remove, this.person.id, 'parent_companies', 'peopleKeys');
    this.fb.removeItemsArray(this.origLocations.remove, this.person.id, 'locations', 'peopleKeys');
    this.fb.removeItemsArray(this.origCompanies.remove, this.person.id, 'companies', 'peopleKeys');
  }

  compareOrigToAdd() {
    for(let item of this.person.companyKeys) {
      if(this.origCompanies.orig.indexOf(item) == -1) {
        this.origCompanies.add.push(item);
      }
    }
    for(let item of this.person.locationKeys) {
      if(this.origLocations.orig.indexOf(item) == -1) {
        this.origLocations.add.push(item);
      }
    }
    for(let item of this.person.parentCompanyKeys) {
      if(this.origParentCompanies.orig.indexOf(item) == -1) {
        this.origParentCompanies.add.push(item);
      }
    }
    this.fb.addItemsArray(this.origParentCompanies.add, this.person.id, 'parent_companies', 'peopleKeys');
    this.fb.addItemsArray(this.origLocations.add, this.person.id, 'locations', 'peopleKeys');
    this.fb.addItemsArray(this.origCompanies.add, this.person.id, 'companies', 'peopleKeys');
  }

  checkForIsLead() {
      let sub = this.fb.getLeadForContact('people', this.fb.sidebarData.id).subscribe((lead:any) => {
        sub.unsubscribe();
        console.log('lead')
        console.log(lead)
        if(lead.length != 1) {
          let tmp = new Lead();
          tmp.receiverKey = this.fb.sidebarData.id;
          tmp.receiverType = 'people';
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
    this.person = this.fb.sidebarData;
    this.fb.error = '';
    if(this.person.firstName == '' && this.person.lastName == '') {
      this.loading.hideLoading();
      this.fb.error = "Yo, put a name!";
    }
    else {
      this.person.address = this.fb.sidebarAddress;

      if(this.fb.sidebarIsEdit) {
        this.person.dateUpdated = new Date();
        this.checkForIsLead();
        this.compareOrigToAdd();
        this.compareOrigToRemove();
        this.fb.updatePerson(this.person).then((rt) => {
          if(this.fb.cities.indexOf(this.person.address.city) == -1) {
            this.fb.addCity(this.person.address.city);
          }
          this.loading.hideLoading();
          this.fb.openSnackBar('Added Successfully');
          this.fb.error = '';
          this.fb.sidebarIsEdit = false;
          this.fb.setPeopleIndex();
          this.close();
        })
          .catch((e) => {
            this.fb.error = e;
            this.loading.hideLoading();
          });
      }
      else {
        this.person = JSON.parse(JSON.stringify(this.person));
        this.person.dateAdded = new Date(this.person.dateAdded);
        this.person.dateUpdated = new Date(this.person.dateUpdated);
        this.person.addedBy = this.fb.auth.auth.currentUser.uid;

        this.fb.addNewPerson(this.person).then((rt) => {
          if (this.fb.cities.indexOf(this.person.address.city) == -1) {
            this.fb.addCity(this.person.address.city);
          }
          this.fb.setPeopleIndex();
          this.fb.sidebarData.id = rt.id;
          this.checkForIsLead();

          if(this.fb.sidebarIsAdd == true) {
            if(isNullOrUndefined(this.fb.sidebarAddToTypeData.peopleKeys)) {
              this.fb.sidebarAddToTypeData.peopleKeys = [];
            }
            this.fb.sidebarAddToTypeData.peopleKeys.push(rt.id);
            this.fb.updateItem(this.fb.sidebarAddToTypeData, this.fb.sidebarAddToType).then(() => {
            }).catch((e) => {
              this.fb.error = e;
              this.loading.hideLoading();
              this.fb.openSnackBar('Error')
            });
          }

          this.fb.addItemsArray(this.person.companyKeys, rt.id, 'companies', 'peopleKeys');
          this.fb.addItemsArray(this.person.locationKeys, rt.id, 'locations', 'peopleKeys');
          this.fb.addItemsArray(this.person.parentCompanyKeys, rt.id, 'parent_companies', 'peopleKeys');

          this.fb.openSnackBar('Added Successfully');
          this.loading.hideLoading();
          this.person = new Person();
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
