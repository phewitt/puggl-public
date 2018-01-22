import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {SettingsService} from "../../core/settings/settings.service";
import {EmailListItem} from "../../models/email-list-item";
import {Location} from "../../models/location";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {isNullOrUndefined} from "util";
import {ParentCompany} from "../../models/parent-company";
import {Company} from "../../models/company";
import {Person} from "../../models/person";

declare var $: any;
import * as localforage from "localforage";

@Component({
  selector: 'email-list-locations',
  templateUrl: './email-list-locations.component.html',
  styleUrls: ['./email-list-locations.component.scss']
})
export class EmailListLocationsComponent implements OnInit {
  locations: any;
  totalRecords = 0;
  type = 'locations';

  constructor(
    public fb: FirebaseService,
    private settings: SettingsService,
    private gcf: GCFMiddlewareService
  ) { }

  ngOnInit() {
    localforage.getItem('locations').then((people:any) => {
      if(isNullOrUndefined(people)) {
        this.gcf.getLocations().toPromise().then((data:any) => {
          this.totalRecords = data.length;
          this.locations = data;
          localforage.setItem('locations', data);
        });
      }
      else {
        this.totalRecords = people.length;
        this.locations = people;
      }
    });
  }

  edit(id) {
    this.fb.getLocation(id).snapshotChanges().subscribe((data: any) => {
      this.fb.sidebarData = new Location();
      this.fb.sidebarData  = data.payload.data();
      this.fb.sidebarData.id = data.payload.id;
      this.fb.sidebarAddress = this.fb.sidebarData.address;

      this.fb.sidebarIsEdit = true;
      this.fb.sidebarForm = 'location';
      this.settings.layout.offsidebarOpen = true;
      // $('#app-root').addClass('offsidebar-open');
    });
  }

  editPerson(id) {
    this.fb.getPerson(id).snapshotChanges().subscribe((data: any) => {
      this.fb.sidebarData = new Person();
      this.fb.sidebarData  = data.payload.data();
      this.fb.sidebarData.id = data.payload.id;
      this.fb.sidebarAddress = this.fb.sidebarData.address;

      this.fb.sidebarIsEdit = true;
      this.fb.sidebarForm = 'person';
      this.settings.layout.offsidebarOpen = true;
      // $('#app-root').addClass('offsidebar-open');
    });
  }

  editCompany(id) {
    this.fb.getCompany(id).snapshotChanges().subscribe((data: any) => {
      this.fb.sidebarData = new Company();
      this.fb.sidebarData  = data.payload.data();
      this.fb.sidebarData.id = data.payload.id;
      this.fb.sidebarAddress = this.fb.sidebarData.address;

      this.fb.sidebarIsEdit = true;
      this.fb.sidebarForm = 'company';
      this.settings.layout.offsidebarOpen = true;
      // $('#app-root').addClass('offsidebar-open');
    });
  }

  editParentCompany(id) {
    this.fb.getParentCompany(id).snapshotChanges().subscribe((data: any) => {
      this.fb.sidebarData = new ParentCompany();
      this.fb.sidebarData  = data.payload.data();
      this.fb.sidebarData.id = data.payload.id;
      this.fb.sidebarAddress = this.fb.sidebarData.address;

      this.fb.sidebarIsEdit = true;
      this.fb.sidebarForm = 'parent-company';
      this.settings.layout.offsidebarOpen = true;
    });
  }

  addToEmailList(id:string, name, email) {
    let item = new EmailListItem(this.type, id);

    this.fb.emailList.items.push(item);
    this.fb.emailList.locationIndex[id] = true;
  }

  removeFromEmailList(id:string) {
    let index = 0;
    for(let item of this.fb.emailList.items) {
      if(item.type == this.type && item.key == id) {
        this.fb.emailList.items.splice(index, 1);
        break;
      }
      index++;
    }
    this.fb.emailList.locationIndex[id] = false;
  }

}
