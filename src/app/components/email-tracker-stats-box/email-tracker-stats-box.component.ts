import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {Observable} from "rxjs/Observable";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {isNullOrUndefined} from "util";

const swal = require('sweetalert');

@Component({
  selector: 'email-tracker-stats-box',
  templateUrl: './email-tracker-stats-box.component.html',
  styleUrls: ['./email-tracker-stats-box.component.scss']
})
export class EmailTrackerStatsBoxComponent implements OnInit, OnChanges {
  @Input() id;
  @Input() type;
  @Input() data;

  showEmailsToTypeOnly = false;
  emailTrackers: any;
  soloEmail: any;
  oldId = '';

  @ViewChild('lgModal') lgModal;
  @ViewChild('emailModal') emailModal;
  options: Object = {
    placeholderText: 'Email body goes here!',
    charCounterCount: true,
    fontSizeDefaultSelection: '14',
    heightMin: 200,
    toolbarButtons: ['bold', 'italic', 'underline', '|', 'fontFamily', 'fontSize', 'color', 'paragraphStyle', '|', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', '-', 'insertLink', 'insertImage', 'embedly', 'insertTable', '|', 'emoticons', 'insertHR', 'selectAll', 'clearFormatting', '|', 'spellChecker', 'help', 'html', '|', 'undo', 'redo']
  };
  email = {
    subject: '',
    useSignature: true,
    body: '',
    receiverKey: '',
    receiverType: '',
    sentBy: '',
    cc: '',
    email: ''
  };

  activity = {
    note: '',
    type: '',
    person: '',
    date: new Date(),
    postedTo: '',
    postedToType: '',
    isTodo: false
  };

  emailTemplates: any;
  selectedEmailTemplate: any;

  constructor(
    public fb: FirebaseService,
    private gcf: GCFMiddlewareService
  ) { }

  ngOnInit() {

  }

  ngOnChanges() {
    if(!isNullOrUndefined(this.data)) {
      this.oldId = this.id;
      this.gcf.getEmailTrackersForAType(this.id, this.type).toPromise().then((data:any) => {
        this.emailTrackers = data;
      });
    }
  }

  updateEmailTrackers() {
    this.emailTrackers = null;
    if(this.showEmailsToTypeOnly) {
      this.gcf.getEmailTrackersForATypeAndNoOneElse(this.id, this.type).toPromise().then((data:any) => {
        this.emailTrackers = data;
      });
    }
    else {
      this.gcf.getEmailTrackersForAType(this.id, this.type).toPromise().then((data:any) => {
        this.emailTrackers = data;
      });
    }
  }

  showSendEmailModal() {
    this.emailTemplates = this.fb.getEmailTemplates();
    this.lgModal.show();
  }

  updateEmailTemplate() {
    this.email.body = this.selectedEmailTemplate;
  }

  showViewEmailModal(soloEmailId) {
    let sub = this.fb.getSoloEmail(soloEmailId).subscribe((email) => {
      this.soloEmail = email;
      sub.unsubscribe();
      this.emailModal.show();
    });
    // console.log(soloEmailId);
  }

  sendEmail() {
    this.email.receiverKey = this.id;
    this.email.receiverType = this.type;
    this.email.email = this.fb.user.email;
    this.email.sentBy = this.fb.auth.auth.currentUser.uid;

    if(this.email.subject != '' && this.email.body != '') {
      swal({
        title: 'Are you sure you want to send the email?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#607d8b',
        confirmButtonText: 'Yes, send it!',
        closeOnConfirm: true
      }, () => {
        console.log('this.email =====\n', this.email)
          this.fb.addSoloEmail(this.email).then(() => {
            this.lgModal.hide();

            if(this.type == 'people') {
              this.activity.note = `Email sent to ${this.data.firstName} ${this.data.lastName}: ${this.email.subject}`;
            }
            else {
              this.activity.note = `Email sent to ${this.data.name}: ${this.email.subject}`;
            }

            for(let id in this.fb.activityTypesIndex) {
              if(this.fb.activityTypesIndex[id] == 'Email') {
                this.activity.type = id;
              }
            }
            this.addActivity();

            this.email = {
              subject: '',
              useSignature: true,
              body: '',
              receiverKey: '',
              receiverType: '',
              sentBy: '',
              cc: '',
              email: ''
            };
            this.fb.openSnackBar('Email Sent');
          }).catch(e => {
            this.fb.openSnackBar('Error');
          });
      });
    }
  }

  addActivity() {
    this.fb.error = '';
    this.activity.date = new Date();
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

    if(this.activity.type == '') {
      this.fb.error = 'Activity Type and Note are required';
    }
    else {
      this.data.id = this.id;
      this.fb.saveActivity(this.activity, this.data, this.type).then(() => {
        this.activity.person = '';
        this.activity.type = '';
        this.activity.note = '';
        this.activity.postedTo = '';
        this.activity.postedToType = '';
      }).catch(e => {
        this.fb.openSnackBar('Error.');
      });
    }
  }
}
