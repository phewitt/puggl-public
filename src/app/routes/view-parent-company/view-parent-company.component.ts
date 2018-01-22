import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FirebaseService} from "../../providers/firebase.service";
import {Observable} from "rxjs/Observable";
import {SettingsService} from "../../core/settings/settings.service";
import {ParentCompany} from "../../models/parent-company";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {LoadingServiceProvider} from "../../providers/loading-service";

declare var $: any;
const swal = require('sweetalert');

@Component({
  selector: 'app-view-parent-company',
  templateUrl: './view-parent-company.component.html',
  styleUrls: ['./view-parent-company.component.scss']
})
export class ViewParentCompanyComponent implements OnInit {
  parentCompanyKey: string;
  parentCompany: Observable<any>;

  constructor(
    private route : ActivatedRoute,
    public fb: FirebaseService,
    private settings: SettingsService,
    private gcf: GCFMiddlewareService,
    private router: Router,
    private loading: LoadingServiceProvider
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.parentCompanyKey = params['parentCompanyKey'];
      this.parentCompany = this.fb.getParentCompany(this.parentCompanyKey).valueChanges();
    });
  }

  editCompany() {
    this.fb.getParentCompany(this.parentCompanyKey).snapshotChanges().subscribe((data: any) => {
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

  delete() {
    swal({
      title: 'Are you sure you want to delete this parent company? This cannot be undone!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f05050',
      confirmButtonText: 'Yes, delete!',
      closeOnConfirm: true
    }, () => {
      this.loading.showLoading();
      let sub = this.fb.getParentCompany(this.parentCompanyKey).valueChanges().subscribe((item:any) => {
        this.fb.removeItemsArray(item.companyKeys, this.parentCompanyKey, 'companies', 'parentCompanyKeys');
        this.fb.removeItemsArray(item.peopleKeys, this.parentCompanyKey, 'people', 'parentCompanyKeys');
        this.fb.removeItemsArray(item.locationKeys, this.parentCompanyKey, 'locations', 'parentCompanyKeys');
        sub.unsubscribe();
        this.gcf.removeAnItem(this.parentCompanyKey, 'parent_companies').toPromise().then(() => {
          this.fb.setParentCompanyIndex();
          this.loading.hideLoading();
          this.fb.openSnackBar('Parent Company Deleted');
          this.router.navigate(['/parent-companies']);
        })
      });

    });
  }
}
