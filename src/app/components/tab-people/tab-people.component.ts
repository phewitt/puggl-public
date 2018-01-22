import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {FirebaseService} from "../../providers/firebase.service";
import {SettingsService} from "../../core/settings/settings.service";
import {isNullOrUndefined} from "util";
import {Address} from "../../models/address";
import {Person} from "../../models/person";

const swal = require('sweetalert');
declare var $: any;

@Component({
  selector: 'tab-people',
  templateUrl: './tab-people.component.html',
  styleUrls: ['./tab-people.component.scss']
})
export class TabPeopleComponent implements OnInit, OnChanges {
  @Input() data;
  @Input() type;
  @Input() id;

  personToAdd: string;
  people: Array<Observable<any>>;
  peopleOptions: Observable<any>;

  itemToAddName: string;
  oldId = '';
  keysLength = 0;

  constructor(
    public fb: FirebaseService,
    private settings: SettingsService,
  ) {

  }

  ngOnInit() {
    this.peopleOptions = this.fb.getPeople();
    this.people = [];
  }

  ngOnChanges() {
    if(!isNullOrUndefined(this.data)) {
      if (this.oldId == '') {
        this.oldId = this.id;
        this.getItems();
        if(!isNullOrUndefined(this.data.peopleKeys)) {
          this.keysLength = this.data.peopleKeys.length
        }
        else {
          this.keysLength = 0;
        }
      }
      else if (this.oldId != this.id) {
        this.oldId = this.id;
        this.getItems();
        if(!isNullOrUndefined(this.data.peopleKeys)) {
          this.keysLength = this.data.peopleKeys.length
        }
        else {
          this.keysLength = 0;
        }
      }
      else if (this.oldId == this.id) {
        if(!isNullOrUndefined(this.data.peopleKeys)) {
          if(this.data.peopleKeys.length != this.keysLength) {
            this.getItems();
          }
          this.keysLength = this.data.peopleKeys.length
        }
      }
    }
  }

  getItems() {
    this.people = [];
    this.data.id = this.id;
    if(this.type == 'parent_companies') {
      this.itemToAddName = 'parentCompanyKeys';
    }
    else if(this.type == 'companies') {
      this.itemToAddName = 'companyKeys';
    }
    else if(this.type == 'locations') {
      this.itemToAddName = 'locationKeys';
    }
    if(!isNullOrUndefined(this.data.peopleKeys)) {
      for(let key of this.data.peopleKeys) {
        this.people.push(this.fb.getPerson(key).snapshotChanges().map(a => {
          const data = a.payload.data();
          const id = a.payload.id;
          return {id, ...data};
        }));
      }
    }
  }

  newPerson() {
    this.fb.sidebarAddress = new Address();
    this.fb.sidebarData = new Person();
    this.fb.sidebarIsEdit = false;

    if(this.type == 'companies') {
      this.fb.sidebarData.parentCompanyKeys = this.data.parentCompanyKeys;
      this.fb.sidebarData.companyKeys.push(this.id);
    }
    else if(this.type == 'locations') {
      this.fb.sidebarData.companyKeys = this.data.companyKeys;
      this.fb.sidebarData.parentCompanyKeys = this.data.parentCompanyKeys;
      this.fb.sidebarData.locationKeys.push(this.id);
    }
    else if(this.type == 'parent_companies') {
      this.fb.sidebarData.parentCompanyKeys.push(this.id);
    }

    this.fb.sidebarIsAdd = true;
    this.fb.sidebarAddToType = this.type;
    this.fb.sidebarAddToTypeData = this.data;

    this.fb.sidebarForm = 'person';
    this.settings.layout.offsidebarOpen = true;
    // $('#app-root').addClass('offsidebar-open');
  }

  addPerson() {
    if(!isNullOrUndefined(this.personToAdd)) {
      if(isNullOrUndefined(this.data.peopleKeys)) {
        this.data.peopleKeys = [];
      }
      if(this.data.peopleKeys.indexOf(this.personToAdd) == -1) {
        this.data.peopleKeys.push(this.personToAdd);

        this.fb.updateItem(this.data, this.type).then((success) => {

          this.fb.addItem(this.personToAdd, 'people', this.itemToAddName, this.data.id);

          this.fb.openSnackBar('Person successfully added.');
        }).catch(e => {
          this.fb.openSnackBar('Error adding Person.');
        });
      }
    }
  }

  remove(id) {
    let index = this.data.peopleKeys.indexOf(id);

    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!',
      closeOnConfirm: true
    }, () => {
      if(index != -1) {
        this.data.peopleKeys.splice(index, 1);
        this.fb.updateItem(this.data, this.type).then((success) => {
          this.fb.removeItem(id, 'people', this.itemToAddName, this.data.id);

          this.fb.openSnackBar('Person successfully added.');
        }).catch(e => {
          this.fb.openSnackBar('Error adding Person.');
        });
      }
    });
  }

  edit(id) {
    this.fb.getPerson(id).snapshotChanges().subscribe((data: any) => {
      this.fb.sidebarData = new Person();
      this.fb.sidebarData  = data.payload.data();
      this.fb.sidebarData.id = data.payload.id;
      this.fb.sidebarAddress = this.fb.sidebarData.address;
      this.fb.sidebarIsAdd = false;

      this.fb.sidebarIsEdit = true;
      this.fb.sidebarForm = 'person';
      this.settings.layout.offsidebarOpen = true;
      // $('#app-root').addClass('offsidebar-open');
    });
  }
}
