import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {Person} from "../../models/person";
import {SettingsService} from "../../core/settings/settings.service";
import {EmailListItem} from "../../models/email-list-item";
import {isNullOrUndefined} from "util";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {Company} from "../../models/company";
import {Location} from "../../models/location";
import {ParentCompany} from "../../models/parent-company";

declare var $: any;
import * as localforage from "localforage";

@Component({
  selector: 'email-list-people',
  templateUrl: './email-list-people.component.html',
  styleUrls: ['./email-list-people.component.scss']
})
export class EmailListPeopleComponent implements OnInit {
  people: any;
  type = 'people';
  totalRecords = 0;

  constructor(
    public fb: FirebaseService,
    private settings: SettingsService,
    private gcf: GCFMiddlewareService
  ) { }

  ngOnInit() {
    localforage.getItem('people').then((people:any) => {
      if(isNullOrUndefined(people)) {
        this.gcf.getPeople().toPromise().then((data:any) => {
          this.totalRecords = data.length;
          this.people = data;
          localforage.setItem('people', data);
        });
      }
      else {
        this.totalRecords = people.length;
        this.people = people;
      }
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

  editLocation(id) {
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

  addToEmailList(id:string) {
    let item = new EmailListItem(this.type, id);

    this.fb.emailList.items.push(item);
    this.fb.emailList.peopleIndex[id] = true;
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
    // console.log(this.fb.emailList.items);
    this.fb.emailList.peopleIndex[id] = false;
  }
}
