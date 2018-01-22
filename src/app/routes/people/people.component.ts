import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {SettingsService} from "../../core/settings/settings.service";
import {Address} from "../../models/address";
import {Person} from "../../models/person";
import {Router} from "@angular/router";
import {isNullOrUndefined} from "util";
import {LazyLoadEvent} from "primeng/primeng";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {Company} from "../../models/company";

import * as localforage from "localforage";

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss']
})
export class PeopleComponent implements OnInit {
  allPeople: any;
  people: any;
  loading = true;
  totalRecords: number;
  sortField: string;
  sortOrder: any;

  constructor(
    public fb: FirebaseService,
    private settings: SettingsService,
    private router: Router,
    private gcf: GCFMiddlewareService
  ) { }


  ngOnInit() {
    localforage.getItem('people').then((people:any) => {
      if(isNullOrUndefined(people)) {
        this.gcf.getPeople().toPromise().then((data:any) => {
          this.loading = false;
          this.totalRecords = data.length;
          this.allPeople = data;
          this.people = this.allPeople.slice(0, 25);
          localforage.setItem('people', data);
        });
      }
      else {
        this.loading = false;
        this.totalRecords = people.length;
        this.allPeople = people;
        this.people = this.allPeople.slice(0, 25);
      }
    });
  }

  newPerson() {
    this.fb.sidebarAddress = new Address();
    this.fb.sidebarData = new Person();
    this.fb.sidebarIsEdit = false;
    this.fb.sidebarForm = 'person';
    this.settings.layout.offsidebarOpen = true;
    // $('#app-root').addClass('offsidebar-open');
  }

  goToPerson(id) {
    this.router.navigate([`people/${id}`]);
  }

  loadLazy(e: LazyLoadEvent) {
    console.log(e);
    this.sortField = e.sortField;
    if(e.sortOrder == -1) {
      this.sortOrder = 'asc';
    }
    else {
      this.sortOrder = 'desc';
    }
    this.loading = true;

    if(this.allPeople) {
      this.people = this.allPeople.slice(e.first, e.first+e.rows);
    }
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
}
