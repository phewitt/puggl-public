import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {ActivatedRoute, Router} from "@angular/router";
import {FirebaseService} from "../../providers/firebase.service";
import {SettingsService} from "../../core/settings/settings.service";
import {Location} from "../../models/location";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {LoadingServiceProvider} from "../../providers/loading-service";

declare var $:any;
const swal = require('sweetalert');

@Component({
  selector: 'app-view-location',
  templateUrl: './view-location.component.html',
  styleUrls: ['./view-location.component.scss']
})
export class ViewLocationComponent implements OnInit {

  locationKey: string;
  location: Observable<any>;

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
      this.locationKey = params['locationKey'];
      this.location = this.fb.getLocation(this.locationKey).valueChanges();
    });
  }

  editCompany() {
    this.fb.getLocation(this.locationKey).snapshotChanges().subscribe((data: any) => {
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

  delete() {
    swal({
      title: 'Are you sure you want to delete this location? This cannot be undone!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f05050',
      confirmButtonText: 'Yes, delete!',
      closeOnConfirm: true
    }, () => {
      this.loading.showLoading();
      let sub = this.fb.getLocation(this.locationKey).valueChanges().subscribe((item:any) => {
        this.fb.removeItemsArray(item.companyKeys, this.locationKey, 'companies', 'locationKeys');
        this.fb.removeItemsArray(item.parentCompanyKeys, this.locationKey, 'parent_companies', 'locationKeys');
        this.fb.removeItemsArray(item.peopleKeys, this.locationKey, 'people', 'locationKeys');
        sub.unsubscribe();
        this.gcf.removeAnItem(this.locationKey, 'locations').toPromise().then(() => {
          this.fb.setLocationIndex();
          this.loading.hideLoading();
          this.fb.openSnackBar('Location Deleted');
          this.router.navigate(['/locations']);
        })
      });

    });
  }

}
