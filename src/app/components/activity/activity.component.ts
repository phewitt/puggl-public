import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {isNullOrUndefined} from "util";
import {Observable} from "rxjs/Observable";
import {LoadingServiceProvider} from "../../providers/loading-service";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {BsDatepickerConfig} from "ngx-bootstrap/datepicker";

@Component({
  selector: 'activity-feed',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit, OnChanges {
  @Input() data;
  @Input() id;
  @Input() type;
  bsConfig: Partial<BsDatepickerConfig>;

  activity = {
    note: '',
    type: '',
    person: '',
    date: new Date(),
    postedTo: '',
    postedToType: '',
    isTodo: false
  };

  activityTypes: Observable<any>;
  people: Array<Observable<any>>;
  activityItems: any;
  newActivityItems: any;

  showActivity = false;
  oldId = '';

  constructor(
    public fb: FirebaseService,
    private loading: LoadingServiceProvider,
    private gcf: GCFMiddlewareService
  ) { }

  ngOnInit() {
    this.activityTypes = this.fb.getActivityTypes();
    this.bsConfig = Object.assign({}, { containerClass: 'theme-dark-blue', showWeekNumbers: false});
  }

  ngOnChanges() {
    if(!isNullOrUndefined(this.data)) {
      this.getActivities();
      // if (this.oldId == '') {
      //   this.oldId = this.id;
      //   this.getActivities();
      // }
      // else if (this.oldId != this.id) {
      //   this.oldId = this.id;
      //   this.getActivities();
      // }
    }
  }

  getActivities() {
    this.people = [];
    this.data.id = this.id;
    this.gcf.getActivityForAItem(this.id, this.type).toPromise().then((items: any) => {
      this.newActivityItems = [];
      for (let item of items) {
        let tmp = item.activity;
        if(item.activity.person != '' && item.activity.isTodo == false) {
          tmp.personId = item.activity.person;
        }
        else if(item.activity.person != '' && item.activity.isTodo == true) {
          tmp.personId = item.activity.person;
          tmp.title == item.activity.title;
        }
        else {
          tmp.personId = null;
        }

        if(item.activity.postedToType == 'Company') {
          tmp.postedToLink = '/companies/'+item.activity.postedTo;
          tmp.postedTo = this.fb.companiesNameIndex[item.activity.postedTo].name;
          tmp.class = 'icon-briefcase';
        }
        else if(item.activity.postedToType == 'Parent Company') {
          tmp.postedToLink = '/parent-companies/'+item.activity.postedTo;
          tmp.postedTo = this.fb.parentCompaniesNameIndex[item.activity.postedTo].name;
          tmp.class = 'icon-diamond';
        }
        else if(item.activity.postedToType == 'Person') {
          tmp.postedToLink = '/people/'+item.activity.postedTo;
          tmp.postedTo = this.fb.peopleNameIndex[item.activity.postedTo].name;
          tmp.class = 'icon-people';
        }
        else if(item.activity.postedToType == 'Location') {
          tmp.postedToLink = '/locations/'+item.activity.postedTo;
          tmp.postedTo = this.fb.locationsNameIndex[item.activity.postedTo].name;
          tmp.class = 'icon-layers';
        }

        this.newActivityItems.push(tmp);
      }
      this.activityItems = this.newActivityItems;
    });
  }

  showNewActivity() {
    this.activity.date = new Date();
    this.showActivity = !this.showActivity;
  }

  hideActivity() {
    this.fb.hideActivity = !this.fb.hideActivity;
  }

  saveActivity() {
    this.loading.showLoading();
    this.fb.error = '';
    this.activity.postedTo = this.id;

    if(this.type == 'companies') {
      this.activity.postedToType = 'Company';
    }
    else if(this.type == 'parent_companies') {
      this.activity.postedToType = 'Parent Company';
    }
    else if(this.type == 'locations') {
      this.activity.postedToType = 'Location';
    }
    else if(this.type == 'people') {
      this.activity.postedToType = 'Person';
    }

    if(this.activity.type == '' || this.activity.note == '') {
      this.fb.error = 'Activity Type and Note are required';
      this.loading.hideLoading();
    }
    else {
      this.fb.saveActivity(this.activity, this.data, this.type).then(() => {
        this.fb.openSnackBar('Successfully added Activity.');
        this.getActivities();
        this.showNewActivity();
        this.activity.person = '';
        this.activity.type = '';
        this.activity.note = '';
        this.activity.postedTo = '';
        this.activity.postedToType = '';
        this.loading.hideLoading();
      }).catch(e => {
        this.fb.openSnackBar('Error.');
        this.loading.hideLoading();
      });
    }
  }
}
