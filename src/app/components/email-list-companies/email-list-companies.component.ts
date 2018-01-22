import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {SettingsService} from "../../core/settings/settings.service";
import {Company} from "../../models/company";
import {EmailListItem} from "../../models/email-list-item";
import {isNullOrUndefined} from "util";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {Person} from "../../models/person";
import {ParentCompany} from "../../models/parent-company";
import {Location} from "../../models/location";

declare var $: any;
import * as localforage from "localforage";

@Component({
  selector: 'email-list-companies',
  templateUrl: './email-list-companies.component.html',
  styleUrls: ['./email-list-companies.component.scss']
})
export class EmailListCompaniesComponent implements OnInit {
  companies: any;
  totalRecords = 0;
  type = 'companies';

  constructor(
    public fb: FirebaseService,
    private settings: SettingsService,
    private gcf: GCFMiddlewareService
  ) { }

  ngOnInit() {
    localforage.getItem('companies').then((people:any) => {
      if(isNullOrUndefined(people)) {
        this.gcf.getCompanies().toPromise().then((data:any) => {
          this.totalRecords = data.length;
          this.companies = data;
          localforage.setItem('companies', data);
        });
      }
      else {
        this.totalRecords = people.length;
        this.companies = people;
      }
    });
  }

  edit(id) {
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

  addToEmailList(id:string) {
    let item = new EmailListItem(this.type, id);

    this.fb.emailList.items.push(item);
    this.fb.emailList.companyIndex[id] = true;
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
    this.fb.emailList.companyIndex[id] = false;
  }

}
