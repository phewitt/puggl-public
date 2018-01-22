import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {SettingsService} from "../../core/settings/settings.service";
import {isNullOrUndefined} from "util";
import {Address} from "../../models/address";
import {Location} from "../../models/location";

const swal = require('sweetalert');
declare var $: any;

@Component({
  selector: 'tab-locations',
  templateUrl: './tab-locations.component.html',
  styleUrls: ['./tab-locations.component.scss']
})
export class TabLocationsComponent implements OnInit, OnChanges {
  @Input() data;
  @Input() type;
  @Input() id;

  locationToAdd: string;

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
    this.data.id = this.id;
    if(this.type == 'parent_companies') {
      this.itemToAddName = 'parentCompanyKeys';
    }
    else if(this.type == 'companies') {
      this.itemToAddName = 'companyKeys';
    }
    else if(this.type == 'people') {
      this.itemToAddName = 'peopleKeys';
    }
  }

  newLocation() {
    this.fb.sidebarAddress = new Address();
    this.fb.sidebarData = new Location();
    this.fb.sidebarIsEdit = false;

    if(this.type == 'parent_companies') {
      this.fb.sidebarData.parentCompanyKeys.push(this.id);
    }
    else if(this.type == 'companies') {
      this.fb.sidebarData.parentCompanyKeys = this.data.parentCompanyKeys;
      this.fb.sidebarData.companyKeys.push(this.id);
    }
    else if(this.type == 'people') {
      this.fb.sidebarData.parentCompanyKeys = this.data.parentCompanyKeys;
      this.fb.sidebarData.companyKeys = this.data.companyKeys;
      this.fb.sidebarData.peopleKeys.push(this.id);
    }

    this.fb.sidebarIsAdd = true;
    this.fb.sidebarAddToType = this.type;
    this.fb.sidebarAddToTypeData = this.data;

    this.fb.sidebarForm = 'location';
    this.settings.layout.offsidebarOpen = true;
    // $('#app-root').addClass('offsidebar-open');
  }

  addLocation() {
    if(!isNullOrUndefined(this.locationToAdd)) {
      if(isNullOrUndefined(this.data.locationKeys)) {
        this.data.locationKeys = [];
      }
      if(this.data.locationKeys.indexOf(this.locationToAdd) == -1) {
        this.data.locationKeys.push(this.locationToAdd);

        this.fb.updateItem(this.data, this.type).then((success) => {

          this.fb.addItem(this.locationToAdd, 'locations', this.itemToAddName, this.data.id);

          this.fb.openSnackBar('Company successfully added.');
        }).catch(e => {
          this.fb.openSnackBar('Error adding Company.');
        });
      }
    }
  }

  remove(id) {
    // console.log(this.data.locationKeys.indexOf(id))
    let index = this.data.locationKeys.indexOf(id);

    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!',
      closeOnConfirm: true
    }, () => {
      if(index != -1) {
        this.data.locationKeys.splice(index, 1);
        this.fb.updateItem(this.data, this.type).then((success) => {
          this.fb.removeItem(id, 'locations', this.itemToAddName, this.data.id);

          this.fb.openSnackBar('Company successfully added.');
        }).catch(e => {
          this.fb.openSnackBar('Error adding Company.');
        });
      }
    });
  }

  edit(id) {
    this.fb.getLocation(id).snapshotChanges().subscribe((data: any) => {
      this.fb.sidebarData = new Location();
      this.fb.sidebarData  = data.payload.data();
      this.fb.sidebarData.id = data.payload.id;
      this.fb.sidebarAddress = this.fb.sidebarData.address;
      this.fb.sidebarIsAdd = false;

      this.fb.sidebarIsEdit = true;
      this.fb.sidebarForm = 'location';
      this.settings.layout.offsidebarOpen = true;
      // $('#app-root').addClass('offsidebar-open');
    });
  }
}
