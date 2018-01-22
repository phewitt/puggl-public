import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {SettingsService} from "../../core/settings/settings.service";
import {Address} from "../../models/address";
import {Company} from "../../models/company";
import {Router} from "@angular/router";
import {isNullOrUndefined} from "util";
import {LazyLoadEvent} from "primeng/primeng";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";

import * as localforage from "localforage";

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit {
  allCompanies: any;
  companies: any;
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
    localforage.getItem('companies').then((companies:any) => {
      if(isNullOrUndefined(companies)) {
        this.gcf.getCompanies().toPromise().then((data:any) => {
          this.loading = false;
          this.totalRecords = data.length;
          this.allCompanies = data;
          this.companies = this.allCompanies.slice(0, 25);
          localforage.setItem('companies', companies);
        });
      }
      else {
        this.loading = false;
        this.totalRecords = companies.length;
        this.allCompanies = companies;
        this.companies = this.allCompanies.slice(0, 25);
      }
    });
  }

  newCompany() {
    this.fb.sidebarAddress = new Address();
    this.fb.sidebarData = new Company();
    this.fb.sidebarIsEdit = false;
    this.fb.sidebarIsAdd = false;
    this.fb.sidebarForm = 'company';
    this.settings.layout.offsidebarOpen = true;
    // $('#app-root').addClass('offsidebar-open');
  }

  goToCompany(id) {
    this.router.navigate([`companies/${id}`]);
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

    if(this.allCompanies) {
      this.companies = this.allCompanies.slice(e.first, e.first+e.rows);
    }
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
