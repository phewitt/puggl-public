import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FirebaseService} from "../../providers/firebase.service";
import {LoadingServiceProvider} from "../../providers/loading-service";
import {EmailCampaign} from "../../models/email-campaign";
import {Observable} from "rxjs/Observable";
import {isNullOrUndefined} from "util";

const swal = require('sweetalert');

@Component({
  selector: 'app-email-campaign-edit',
  templateUrl: './email-campaign-edit.component.html',
  styleUrls: ['./email-campaign-edit.component.scss']
})
export class EmailCampaignEditComponent implements OnInit {
  emailCampaignKey:string;

  emailCampaign = new EmailCampaign();
  emailTemplates: Observable<any>;
  emailTemplate: Observable<any>;
  emailLists: Observable<any>;
  emailList: Observable<any>;

  userData: any = {};
  showProgressBar= false;
  value: number = 0;

  activity = {
    note: '',
    type: '',
    person: '',
    date: new Date(),
    postedTo: '',
    postedToType: '',
    isTodo: false
  };

  constructor(
    private route: ActivatedRoute,
    public fb: FirebaseService,
    private loading: LoadingServiceProvider,
    private router: Router
  ) { }

  ngOnInit() {
    this.emailTemplates = this.fb.getEmailTemplates();
    this.emailLists = this.fb.getEmailLists();

    setTimeout(() => {
      let sub = this.fb.getUserData().valueChanges().subscribe((user: any) => {
        this.userData = user;
        sub.unsubscribe();
      });
    }, 500);

    this.route.params.subscribe((params) => {
      this.emailCampaignKey = params['emailCampaignKey'];
        this.emailCampaign = new EmailCampaign();
        this.fb.fs.doc('email_campaigns/'+this.emailCampaignKey).snapshotChanges().map(a => {
          const data = a.payload.data();
          const id = a.payload.id;
          return {id, ...data};
        }).subscribe((emailCampaign: any) => {
          this.emailCampaign = emailCampaign;
          if(this.emailCampaign.emailTemplateKey != '') {
            this.setEmailTemplate();
          }
          if(this.emailCampaign.emailListKey != '') {
            this.setEmailList();
          }
        });
    });
  }

  setEmailTemplate() {
    this.emailTemplate = this.fb.getEmailTemplate(this.emailCampaign.emailTemplateKey).valueChanges();
  }

  setEmailList() {
    if(this.emailCampaign.hasBeenSent) {
      console.log('get list yo')
      this.emailList = this.fb.getEmailTrackers(this.emailCampaign.id);
    }
    else {
      this.emailList = this.fb.getEmailList(this.emailCampaign.emailListKey).valueChanges();
    }
  }

  updateEmailCampaign() {
    let ec = JSON.parse(JSON.stringify(this.emailCampaign));
    ec.dateCreated = new Date(ec.dateCreated);
    this.fb.updateEmailCampaign(ec).then((rt) => {
      this.fb.openSnackBar('Email campaign saved Successfully');
    })
      .catch((e) => {
        this.fb.openSnackBar('Error');
      });
  }

  canSendEmails() {
    if(this.emailCampaign.name == '') {
      return false;
    }
    else if(this.emailCampaign.subject == '') {
      return false;
    }
    else if(this.emailCampaign.emailListKey == '') {
      return false;
    }
    else if(this.emailCampaign.emailTemplateKey == '') {
      return false;
    }

    else {
      return true;
    }
  }

  alertSendEmails() {
    swal({
      title: 'Are you sure you want to send this campaign?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#607d8b',
      confirmButtonText: 'Yes, send them!',
      closeOnConfirm: true
    }, () => {
      this.sendEmails();
    });
  }

  sendEmails() {
    this.value = 0;
    this.showProgressBar = true;
    if(isNullOrUndefined(this.userData)) {
      this.fb.error = 'You are missing your user data';
    }
    else if(isNullOrUndefined(this.userData.googleEmail)) {
      this.fb.error = 'You are missing a Google Email on your user data';
    }
    else if(isNullOrUndefined(this.userData.googlePassword)) {
      this.fb.error = 'You are missing a Google Password on your user data';
    }
    else if(isNullOrUndefined(this.userData.name) || this.userData.name == '') {
      this.fb.error = 'You are missing a name on your user data';
    }
    this.emailCampaign.userWhoSentItKey = this.fb.auth.auth.currentUser.uid;
    let ec = JSON.parse(JSON.stringify(this.emailCampaign));
    ec.dateCreated = new Date(ec.dateCreated);
    this.fb.updateEmailCampaign(ec).then((rt) => {
      let sub = this.fb.getEmailList(this.emailCampaign.emailListKey).valueChanges().subscribe((emailList:any) => {
        let sub2 = this.fb.getEmailTrackerCounter().valueChanges().subscribe((counter:any) => {
          var emailTrackerCounter = counter.seq;
          sub2.unsubscribe();
          console.log('start: ', emailTrackerCounter);
          sub.unsubscribe();
          this.batchSendEmails(emailList, emailTrackerCounter);
        });
      });
    }).catch((e) => {
        this.fb.openSnackBar('Error');
      });
  }

  async batchSendEmails(emailList, emailTrackerCounter) {
    var count = 0;
    var items = emailList.items.length;
    // console.log(items)
    for(let item of emailList.items) {
      this.value = (count/(items + 1))*100;
      let data = {
        emailCampaignKey: this.emailCampaignKey,
        receiverType: item.type,
        receiverKey: item.key,
        counter: emailTrackerCounter
      };
      await this.fb.sendEmail(data).then(() => {
        emailTrackerCounter++;
        count++;

        let newActivity = this.activity;

        for(let id in this.fb.activityTypesIndex) {
          if(this.fb.activityTypesIndex[id] == 'Email Campaign') {
            newActivity.type = id;
          }
        }
        this.addActivity(data.receiverType, data.receiverKey, newActivity);

        if(items == count) {
          this.value = 100;
          this.fb.openSnackBar('Emails Sent Successfully');
          this.showProgressBar = false;
          let sub3 = this.fb.getEmailTemplate(this.emailCampaign.emailTemplateKey).valueChanges().subscribe((emailTemplate: any) => {
            this.fb.setEmailTrackerCounter(Number(emailTrackerCounter));
            this.fb.setEmailCampaignTrigger(this.emailCampaignKey);
            sub3.unsubscribe();
            let ec = JSON.parse(JSON.stringify(this.emailCampaign));
            ec.dateCreated = new Date(ec.dateCreated);
            ec.emailSent = emailTemplate.email;
            ec.dateSent = new Date();
            ec.hasBeenSent = true;
            this.setEmailList();
            this.fb.updateEmailCampaign(ec).then((rt) => {
            });
          });
        }
      });
    }
  }

  addActivity(type, id, newActivity) {
    this.fb.error = '';
    newActivity.date = new Date();
    newActivity.postedTo = id;

    if(type == 'companies') {
      newActivity.postedToType = 'Company';
    }
    else if(type == 'parent_companies') {
      newActivity.postedToType = 'Parent Company';
    }
    else if(type == 'locations') {
      newActivity.postedToType = 'Location';
    }
    else if(type == 'people') {
      newActivity.postedToType = 'Person';
    }

    if(this.activity.type == '') {
      this.fb.error = 'Activity Type is required';
    }
    else {
      let subb = this.fb.getItem(id, type).valueChanges().subscribe((data: any) => {
         let tmp = data;
         tmp.id = id;
        newActivity.note = `Email campaign sent to: ${data.email} - ${this.emailCampaign.name}`;
        subb.unsubscribe();
        this.fb.saveActivity(this.activity, tmp, type, false).then(() => {
        }).catch(e => {
          this.fb.openSnackBar('Error.');
        });
      });

    }
  }
}
