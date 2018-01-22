import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {FirebaseService} from "../../providers/firebase.service";
import {SettingsService} from "../../core/settings/settings.service";
import {isNullOrUndefined} from "util";
import {Address} from "../../models/address";
import {ParentCompany} from "../../models/parent-company";

const swal = require('sweetalert');
declare var $: any;

@Component({
  selector: 'tab-parent-company',
  templateUrl: './tab-parent-company.component.html',
  styleUrls: ['./tab-parent-company.component.scss']
})
export class TabParentCompanyComponent implements OnInit, OnChanges {
  @Input() data;
  @Input() type;
  @Input() id;

  parentCompanyToAdd: string;

  itemToAddName: string;

  constructor(
    public fb: FirebaseService,
    private settings: SettingsService,
  ) {
  }

  ngOnInit() {
    // this.parentCompanyOptions = this.fb.getParentCompanies();
    // this.parentCompanies = [];
  }

  ngOnChanges() {
    if(!isNullOrUndefined(this.data)) {
      this.getItems();
    }
  }

  getItems() {
    this.data.id = this.id;
    if(this.type == 'companies') {
      this.itemToAddName = 'companyKeys';
    }
    else if(this.type == 'locations') {
      this.itemToAddName = 'locationKeys';
    }
    else if(this.type == 'people') {
      this.itemToAddName = 'peopleKeys';
    }
  }

  newParentCompany() {
    this.fb.sidebarAddress = new Address();
    this.fb.sidebarData = new ParentCompany();
    this.fb.sidebarIsEdit = false;


    if(this.type == 'companies') {
      this.fb.sidebarData.locationKeys = this.data.locationKeys;
      this.fb.sidebarData.peopleKeys = this.data.peopleKeys;
      this.fb.sidebarData.companyKeys.push(this.id);
    }
    else if(this.type == 'locations') {
      this.fb.sidebarData.companyKeys = this.data.companyKeys;
      this.fb.sidebarData.peopleKeys = this.data.peopleKeys;
      this.fb.sidebarData.locationKeys.push(this.id);
    }
    else if(this.type == 'people') {
      this.fb.sidebarData.companyKeys = this.data.companyKeys;
      this.fb.sidebarData.locationKeys = this.data.locationKeys;
      this.fb.sidebarData.peopleKeys.push(this.id);
    }

    this.fb.sidebarIsAdd = true;
    this.fb.sidebarAddToType = this.type;
    this.fb.sidebarAddToTypeData = this.data;

    this.fb.sidebarForm = 'parent-company';
    this.settings.layout.offsidebarOpen = true;
    // $('#app-root').addClass('offsidebar-open');
    // console.log(this.settings.layout.offsidebarOpen)
  }

  addParentCompany() {
    if(!isNullOrUndefined(this.parentCompanyToAdd)) {
      if(isNullOrUndefined(this.data.parentCompanyKeys)) {
        this.data.parentCompanyKeys = [];
      }
      if(this.data.parentCompanyKeys.indexOf(this.parentCompanyToAdd) == -1) {
        this.data.parentCompanyKeys.push(this.parentCompanyToAdd);

        this.fb.updateItem(this.data, this.type).then((success) => {

          this.fb.addItem(this.parentCompanyToAdd, 'parent_companies', this.itemToAddName, this.data.id);

          this.fb.openSnackBar('Parent Company successfully added.');
        }).catch(e => {
          this.fb.openSnackBar('Error adding Parent Company.');
        });
      }
    }
  }

  remove(id) {
    // console.log(this.data.parentCompanyKeys.indexOf(id))
    let index = this.data.parentCompanyKeys.indexOf(id);

    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!',
      closeOnConfirm: true
    }, () => {
      if(index != -1) {
        this.data.parentCompanyKeys.splice(index, 1);
        this.fb.updateItem(this.data, this.type).then((success) => {
          this.fb.removeItem(id, 'parent_companies', this.itemToAddName, this.data.id);

          this.fb.openSnackBar('Parent Company successfully added.');
        }).catch(e => {
          this.fb.openSnackBar('Error adding Parent Company.');
        });
      }
    });
  }

  edit(id) {
    this.fb.getParentCompany(id).snapshotChanges().subscribe((data: any) => {
      this.fb.sidebarData = new ParentCompany();
      this.fb.sidebarData  = data.payload.data();
      this.fb.sidebarData.id = data.payload.id;
      this.fb.sidebarAddress = this.fb.sidebarData.address;
      this.fb.sidebarIsAdd = false;

      this.fb.sidebarIsEdit = true;
      this.fb.sidebarForm = 'parent-company';
      this.settings.layout.offsidebarOpen = true;
      // $('#app-root').addClass('offsidebar-open');
    });
  }
}
