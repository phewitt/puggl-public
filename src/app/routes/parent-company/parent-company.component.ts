import {Component, OnInit} from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {SettingsService} from "../../core/settings/settings.service";
import {Router} from "@angular/router";
import {Address} from "../../models/address";
import {ParentCompany} from "../../models/parent-company";
import {isNullOrUndefined} from "util";
import {LazyLoadEvent} from "primeng/primeng";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";

// import * as localforage from "localforage";
import * as localforage from "localforage";

@Component({
  selector: 'app-parent-company',
  templateUrl: './parent-company.component.html',
  styleUrls: ['./parent-company.component.scss']
})
export class ParentCompanyComponent implements OnInit {
  parentCompanies: any;
  allParentCompanies: any;
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
    localforage.getItem('parent_companies').then((parent_companies:any) => {
      if(isNullOrUndefined(parent_companies)) {
        this.gcf.getParentCompanies().toPromise().then((data:any) => {
          this.totalRecords = data.length;
          this.allParentCompanies = data;
          this.loading = false;
          // this.parentCompanies = this.allParentCompanies.slice(0, 25);
          localforage.setItem('parent_companies', data);
        });
      }
      else {
        this.totalRecords = parent_companies.length;
        this.allParentCompanies = parent_companies;
        this.loading = false;
        // this.parentCompanies = this.parentCompanies.slice(0, 25);
      }
    });
  }

  newParentCompany() {
    this.fb.sidebarAddress = new Address();
    this.fb.sidebarData = new ParentCompany();
    this.fb.sidebarIsEdit = false;
    this.fb.sidebarForm = 'parent-company';
    this.settings.layout.offsidebarOpen = true;
    // $('#app-root').addClass('offsidebar-open');
  }

  goToParentCompany(id) {
    this.router.navigate([`parent-companies/${id}`]);
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

    if(this.allParentCompanies) {
      this.parentCompanies = this.allParentCompanies.slice(e.first, e.first+e.rows);
    }
  }

  edit(id) {
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
}
