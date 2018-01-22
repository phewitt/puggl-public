import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {isNullOrUndefined} from "util";
import {Address} from "../../models/address";
import {Company} from "../../models/company";
import {SettingsService} from "../../core/settings/settings.service";

const swal = require('sweetalert');
declare var $: any;

@Component({
  selector: 'tab-company',
  templateUrl: './tab-company.component.html',
  styleUrls: ['./tab-company.component.scss']
})
export class TabCompanyComponent implements OnInit, OnChanges {
  @Input() data;
  @Input() type;
  @Input() id;

  companyToAdd: string;

  itemToAddName: string;

  constructor(
    public fb: FirebaseService,
    private settings: SettingsService,
  ) {

  }

  ngOnInit() {
  }

  ngOnChanges() {
    if(!isNullOrUndefined(this.data)) {
      this.getItems();
    }
  }

  getItems() {
    // this.companies = [];
    this.data.id = this.id;
    if(this.type == 'parent_companies') {
      this.itemToAddName = 'parentCompanyKeys';
    }
    else if(this.type == 'locations') {
      this.itemToAddName = 'locationKeys';
    }
    else if(this.type == 'people') {
      this.itemToAddName = 'peopleKeys';
    }
  }

  newCompany() {
    this.fb.sidebarAddress = new Address();
    this.fb.sidebarData = new Company();
    this.fb.sidebarIsEdit = false;

    if(this.type == 'parent_companies') {
      this.fb.sidebarData.parentCompanyKeys.push(this.id);
    }
    else if(this.type == 'locations') {
      this.fb.sidebarData.parentCompanyKeys = this.data.parentCompanyKeys;
      this.fb.sidebarData.locationKeys.push(this.id);
    }
    else if(this.type == 'people') {
      this.fb.sidebarData.parentCompanyKeys = this.data.parentCompanyKeys;
      this.fb.sidebarData.locationKeys = this.data.locationKeys;
      this.fb.sidebarData.peopleKeys.push(this.id);
    }

    this.fb.sidebarIsAdd = true;
    this.fb.sidebarAddToType = this.type;
    this.fb.sidebarAddToTypeData = this.data;

    this.fb.sidebarForm = 'company';
    this.settings.layout.offsidebarOpen = true;
    // $('#app-root').addClass('offsidebar-open');
  }

  addCompany() {
    if(!isNullOrUndefined(this.companyToAdd)) {
      if(isNullOrUndefined(this.data.companyKeys)) {
        this.data.companyKeys = [];
      }
      if(this.data.companyKeys.indexOf(this.companyToAdd) == -1) {
        this.data.companyKeys.push(this.companyToAdd);
        this.fb.updateItem(this.data, this.type).then((success) => {

          this.fb.addItem(this.companyToAdd, 'companies', this.itemToAddName, this.data.id);

          this.fb.openSnackBar('Company successfully added.');
        }).catch(e => {
          console.log(e);
          this.fb.openSnackBar('Error adding Company.');
        });
      }
    }
  }

  remove(id) {
    let index = this.data.companyKeys.indexOf(id);

    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!',
      closeOnConfirm: true
    }, () => {
      if(index != -1) {
        this.data.companyKeys.splice(index, 1);
        this.fb.updateItem(this.data, this.type).then((success) => {
          this.fb.removeItem(id, 'companies', this.itemToAddName, this.data.id);

          this.fb.openSnackBar('Company successfully added.');
        }).catch(e => {
          this.fb.openSnackBar('Error adding Company.');
        });
      }
    });
  }

  edit(id) {
    this.fb.getCompany(id).snapshotChanges().subscribe((data: any) => {
      this.fb.sidebarData = new Company();
      this.fb.sidebarData  = data.payload.data();
      this.fb.sidebarData.id = data.payload.id;
      this.fb.sidebarAddress = this.fb.sidebarData.address;
      this.fb.sidebarIsAdd = false;

      this.fb.sidebarIsEdit = true;
      this.fb.sidebarForm = 'company';
      this.settings.layout.offsidebarOpen = true;
      // $('#app-root').addClass('offsidebar-open');
    });
  }
}
