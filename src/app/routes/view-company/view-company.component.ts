import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {ActivatedRoute, Router} from "@angular/router";
import {FirebaseService} from "../../providers/firebase.service";
import {SettingsService} from "../../core/settings/settings.service";
import {Company} from "../../models/company";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {LoadingServiceProvider} from "../../providers/loading-service";

declare var $:any;
const swal = require('sweetalert');

@Component({
  selector: 'app-view-company',
  templateUrl: './view-company.component.html',
  styleUrls: ['./view-company.component.scss']
})
export class ViewCompanyComponent implements OnInit {

  companyKey: string;
  company: Observable<any>;

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
      this.companyKey = params['companyKey'];
      this.company = this.fb.getCompany(this.companyKey).valueChanges();
    });
  }

  editCompany() {
    this.fb.getCompany(this.companyKey).snapshotChanges().subscribe((data: any) => {
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

  delete() {
    swal({
      title: 'Are you sure you want to delete this company? This cannot be undone!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f05050',
      confirmButtonText: 'Yes, delete!',
      closeOnConfirm: true
    }, () => {
      this.loading.showLoading();
      let sub = this.fb.getCompany(this.companyKey).valueChanges().subscribe((item:any) => {
        console.log(item.peopleKeys, this.companyKey)
        this.fb.removeItemsArray(item.peopleKeys, this.companyKey, 'people', 'companyKeys');
        this.fb.removeItemsArray(item.parentCompanyKeys, this.companyKey, 'parent_companies', 'companyKeys');
        this.fb.removeItemsArray(item.locationKeys, this.companyKey, 'locations', 'companyKeys');
        sub.unsubscribe();
        this.gcf.removeAnItem(this.companyKey, 'companies').toPromise().then(() => {
          this.fb.setCompanyIndex();
          this.loading.hideLoading();
          this.fb.openSnackBar('Company Deleted');
          this.router.navigate(['/companies']);
        });
      });

    });
  }
}
