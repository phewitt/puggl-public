import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";

@Component({
  selector: 'info-block-recent-activity',
  templateUrl: './info-block-recent-activity.component.html',
  styleUrls: ['./info-block-recent-activity.component.scss']
})
export class InfoBlockRecentActivityComponent implements OnInit {
  activityItems: any;
  constructor(
    public fb: FirebaseService,
    private gcf: GCFMiddlewareService
  ) { }

  ngOnInit() {
    this.gcf.getRecentActivity().toPromise().then((items:any) => {
      this.activityItems = [];
      for (let activity of items) {
        let tmp = activity;
        if(activity.person != '' && activity.isTodo == false) {
          tmp.personId = activity.person;
        }
        else if(activity.person != '' && activity.isTodo == true) {
          tmp.personId = activity.person;
          tmp.title == activity.title;
        }
        else {
          tmp.personId = null;
        }

        tmp.postedTo = activity.postedTo;
        tmp.postedToType = activity.postedToType;

        if(activity.postedToType == 'Company') {
          tmp.postedToLink = '/companies/'+activity.postedTo;
          tmp.class = 'icon-briefcase';
        }
        else if(activity.postedToType == 'Parent Company') {
          tmp.postedToLink = '/parent-companies/'+activity.postedTo;
          tmp.class = 'icon-diamond';
        }
        else if(activity.postedToType == 'Person') {
          tmp.postedToLink = '/people/'+activity.postedTo;
          tmp.class = 'icon-people';
        }
        else if(activity.postedToType == 'Location') {
          tmp.postedToLink = '/locations/'+activity.postedTo;
          tmp.class = 'icon-layers';
        }


        this.activityItems.push(tmp);
      }
    });
  }

  hideActivity() {
    this.fb.hideRecentActivity = !this.fb.hideRecentActivity;
  }
}
