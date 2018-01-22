import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {SettingsService} from "../../core/settings/settings.service";
import {Address} from "../../models/address";
import {Location} from "../../models/location";
import {Router} from "@angular/router";
import {Subject} from "rxjs/Subject";
import * as firebase from "firebase";
import {isNullOrUndefined} from "util";
import {LazyLoadEvent} from "primeng/primeng";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
// import OrderByDirection = firebase.firestore.OrderByDirection;

import * as localforage from "localforage";

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit {
  allLocations: any;
  locations: any;
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
    localforage.getItem('locations').then((locations:any) => {
      if(isNullOrUndefined(locations)) {
        this.gcf.getLocations().toPromise().then((data:any) => {
          this.totalRecords = data.length;
          this.allLocations = data;
          this.loading = false;
          this.locations = this.allLocations.slice(0, 25);
          localforage.setItem('locations', data);
        });
      }
      else {
        this.totalRecords = locations.length;
        this.loading = false;
        this.allLocations = locations;
        this.locations = this.allLocations.slice(0, 25);
      }
    });
  }

  newLocation() {
    this.fb.sidebarAddress = new Address();
    this.fb.sidebarData = new Location();
    this.fb.sidebarIsEdit = false;
    this.fb.sidebarForm = 'location';
    this.settings.layout.offsidebarOpen = true;
    // $('#app-root').addClass('offsidebar-open');
  }

  goToLocation(id) {
    this.router.navigate([`locations/${id}`]);
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

    if(this.allLocations) {
      this.locations = this.allLocations.slice(e.first, e.first+e.rows);
    }
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
}
