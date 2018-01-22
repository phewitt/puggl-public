import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {ActivatedRoute, Router} from "@angular/router";
import {FirebaseService} from "../../providers/firebase.service";
import {SettingsService} from "../../core/settings/settings.service";
import {Person} from "../../models/person";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {LoadingServiceProvider} from "../../providers/loading-service";

declare var $:any;
const swal = require('sweetalert');

@Component({
  selector: 'app-view-person',
  templateUrl: './view-person.component.html',
  styleUrls: ['./view-person.component.scss']
})
export class ViewPersonComponent implements OnInit {

  personKey: string;
  person: Observable<any>;

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
      this.personKey = params['personKey'];
      this.person = this.fb.getPerson(this.personKey).valueChanges();
    });
  }

  delete() {
    swal({
      title: 'Are you sure you want to delete this person? This cannot be undone!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f05050',
      confirmButtonText: 'Yes, delete!',
      closeOnConfirm: true
    }, () => {
      this.loading.showLoading();
      let sub = this.fb.getPerson(this.personKey).valueChanges().subscribe((item:any) => {
        this.fb.removeItemsArray(item.companyKeys, this.personKey, 'companies', 'peopleKeys');
        this.fb.removeItemsArray(item.parentCompanyKeys, this.personKey, 'parent_companies', 'peopleKeys');
        this.fb.removeItemsArray(item.locationKeys, this.personKey, 'locations', 'peopleKeys');
        sub.unsubscribe();
        this.gcf.removeAnItem(this.personKey, 'people').toPromise().then(() => {
          this.fb.setPeopleIndex();
          this.loading.hideLoading();
          this.fb.openSnackBar('Person Deleted');
          this.router.navigate(['/people']);
        })
      });

    });
  }

  editCompany() {
    this.fb.getPerson(this.personKey).snapshotChanges().subscribe((data: any) => {
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
