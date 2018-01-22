import { Component, OnInit } from '@angular/core';
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {FirebaseService} from "../../providers/firebase.service";
import {Company} from "../../models/company";
import {SettingsService} from "../../core/settings/settings.service";

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  customers: any;
  numCustomers = 0;

  constructor(
    public gcf: GCFMiddlewareService,
    public fb: FirebaseService,
    public settings: SettingsService
  ) { }

  ngOnInit() {
    this.gcf.getAllCustomers().toPromise().then((customers) => {
      this.customers = customers;
      this.numCustomers = this.customers.length;
    });
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
