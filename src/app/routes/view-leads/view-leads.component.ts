import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {FirebaseService} from "../../providers/firebase.service";
import {isUndefined} from "util";
import {Lead} from "../../models/lead";
import {Person} from "../../models/person";
import {SettingsService} from "../../core/settings/settings.service";
import {ParentCompany} from "../../models/parent-company";
import {Company} from "../../models/company";
import {Location} from "../../models/location";

@Component({
  selector: 'app-view-leads',
  templateUrl: './view-leads.component.html',
  styleUrls: ['./view-leads.component.scss']
})
export class ViewLeadsComponent implements OnInit, OnDestroy {
  leadType: string;
  emailTrackers = {};
  loading = true;
  sub:any;
  trackers = {
    people: {},
    companies: {},
    locations: {}
  };
  warm = [];
  cold = [];
  leads = [];

  constructor(
    private route : ActivatedRoute,
    public fb: FirebaseService,
    private settings: SettingsService
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.leadType = params['leadType'];
      this.sub = this.fb.getLeadsForLeadType(this.leadType).subscribe((leads:any) => {
        this.leads = [];
        // sub.unsubscribe();
        for(let lead of leads) {
          var leadData = lead;
          if(lead.receiverType == 'people') {
            let tmp = this.fb.peopleNameIndex[lead.receiverKey];
            leadData.name = tmp.name;
            leadData.email = tmp.email;
            leadData.city = tmp.city;
            leadData.state = tmp.state;
            leadData.phone = tmp.phone;
            this.leads.push(leadData);
          }
          else if(lead.receiverType == 'locations') {
            let tmp = this.fb.locationsNameIndex[lead.receiverKey];
            leadData.name = tmp.name;
            leadData.email = tmp.email;
            leadData.city = tmp.city;
            leadData.state = tmp.state;
            leadData.phone = tmp.phone;
            this.leads.push(leadData);
          }
          else if(lead.receiverType == 'companies') {
            let tmp = this.fb.companiesNameIndex[lead.receiverKey];
            leadData.name = tmp.name;
            leadData.email = tmp.email;
            leadData.city = tmp.city;
            leadData.state = tmp.state;
            leadData.phone = tmp.phone;
            this.leads.push(leadData);
          }
          else if(lead.receiverType == 'parent_companies') {
            let tmp = this.fb.parentCompaniesNameIndex[lead.receiverKey];
            leadData.name = tmp.name;
            leadData.email = tmp.email;
            leadData.city = tmp.city;
            leadData.state = tmp.state;
            leadData.phone = tmp.phone;
            this.leads.push(leadData);
          }
        }
        console.log(this.leads)
        this.loading = false;
       });

      this.fb.getAllEmailTrackers().subscribe((trackers) => {
        for(let tracker of trackers) {
          this.emailTrackers[tracker.id] = tracker;
        }
        this.getEmailTrackers();

      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  editItem(id, type) {
    if(type == 'people') {
      this.fb.getPerson(id).snapshotChanges().subscribe((data: any) => {
        this.fb.sidebarData = new Person();
        this.fb.sidebarData  = data.payload.data();
        this.fb.sidebarData.id = data.payload.id;
        this.fb.sidebarAddress = this.fb.sidebarData.address;

        this.fb.sidebarIsEdit = true;
        this.fb.sidebarForm = 'person';
        this.settings.layout.offsidebarOpen = true;
      });
    }
    else if(type == 'locations') {
      this.fb.getLocation(id).snapshotChanges().subscribe((data: any) => {
        this.fb.sidebarData = new Location();
        this.fb.sidebarData  = data.payload.data();
        this.fb.sidebarData.id = data.payload.id;
        this.fb.sidebarAddress = this.fb.sidebarData.address;

        this.fb.sidebarIsEdit = true;
        this.fb.sidebarForm = 'location';
        this.settings.layout.offsidebarOpen = true;
      });
    }
    else if(type == 'companies') {
      this.fb.getCompany(id).snapshotChanges().subscribe((data: any) => {
        this.fb.sidebarData = new Company();
        this.fb.sidebarData  = data.payload.data();
        this.fb.sidebarData.id = data.payload.id;
        this.fb.sidebarAddress = this.fb.sidebarData.address;
        this.fb.sidebarIsAdd = false;

        this.fb.sidebarIsEdit = true;
        this.fb.sidebarForm = 'company';
        this.settings.layout.offsidebarOpen = true;
      });
    }
    else if(type == 'parent_companies') {
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

  async getEmailTrackers() {
    this.fb.getAllEmailTrackerViews().subscribe((trackers) => {
      this.getTrackers(trackers)
    });
  }

  async getTrackers(trackers) {
    for (let tracker of trackers) {
      if (tracker.emailCampaignKey != "solo_email") {
        if (isUndefined(this.emailTrackers[tracker.email_tracker_id].views)) {
          this.emailTrackers[tracker.email_tracker_id].views = 1;
        }
        else {
          this.emailTrackers[tracker.email_tracker_id].views++;
        }
      }
    }

    this.fb.getAllEmailTrackerShortUrlClicks().subscribe((clicks: any) => {
      for (let tracker of clicks) {
        if (tracker.emailCampaignKey != "") {
          if (!isUndefined(this.emailTrackers[tracker.emailTrackerKey])) {
            if (isUndefined(this.emailTrackers[tracker.emailTrackerKey].clicks)) {
              this.emailTrackers[tracker.emailTrackerKey].clicks = 1;
            }
            else {
              this.emailTrackers[tracker.emailTrackerKey].clicks++;
            }
          }
        }
      }
      this.warm = [];
      this.cold = [];

      for (let id in this.emailTrackers) {
        if (!isUndefined(this.emailTrackers[id].clicks)) {
          this.warm.push(this.emailTrackers[id]);
        }
        else if (!isUndefined(this.emailTrackers[id].views)) {
          if (this.emailTrackers[id].views > 1) {
            this.warm.push(this.emailTrackers[id]);
          }
          else if (this.emailTrackers[id].views == 1) {
            this.cold.push(this.emailTrackers[id]);
          }
        }
      }
      // console.log('warm: ', this.warm);
      // console.log('cold: ', this.cold);
    });
  }

  addWarmLeads() {
    for(let lead of this.warm) {
      let tmp = new Lead();
      tmp.receiverKey = lead.receiverKey;
      tmp.receiverType = lead.receiverType;
      tmp.leadType = 'warm';
      if(!isUndefined(lead.views)) {
        tmp.views = lead.views;
      }
      if(!isUndefined(lead.clicks)) {
        tmp.clicks = lead.clicks;
      }
      this.fb.addLead(tmp);
      this.fb.addLeadStatusToContact(tmp);
    }
  }

  addColdLeads() {
    for(let lead of this.cold) {
      let tmp = new Lead();
      tmp.receiverKey = lead.receiverKey;
      tmp.receiverType = lead.receiverType;
      tmp.leadType = 'cold';
      if(!isUndefined(lead.views)) {
        tmp.views = lead.views;
      }
      if(!isUndefined(lead.clicks)) {
        tmp.clicks = lead.clicks;
      }
      this.fb.addLead(tmp);
      this.fb.addLeadStatusToContact(tmp);
    }
  }

  async getClicks(tracker) {
    let sub = tracker.shortUrlClicks.subscribe((clicks) => {
      sub.unsubscribe();
      if(clicks.length > 0) {
        console.log(clicks)
      }
      tracker.clickData = clicks;

    });
  }

  async getViews(tracker) {
    let sub = tracker.views.subscribe((views) => {
      sub.unsubscribe();
      if(views.length > 0) {
        console.log(views)
      }
      tracker.viewData = views;

    });
  }
}

