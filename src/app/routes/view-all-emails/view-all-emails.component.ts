import {Component, OnInit, ViewChild} from '@angular/core';
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";
import {FirebaseService} from "../../providers/firebase.service";

@Component({
  selector: 'app-view-all-emails',
  templateUrl: './view-all-emails.component.html',
  styleUrls: ['./view-all-emails.component.scss']
})
export class ViewAllEmailsComponent implements OnInit {
  emailTrackers: any;
  soloEmail: any;
  user: any;

  @ViewChild('emailModal') emailModal;

  constructor(
    private gcf: GCFMiddlewareService,
    public fb: FirebaseService,
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.gcf.getEmailTrackersForUser(this.fb.auth.auth.currentUser.uid).toPromise().then((emailTrackers) => {
        this.emailTrackers = emailTrackers;
      });
    }, 500);
  }

  updateEmails() {
    this.emailTrackers = null;
    this.gcf.getEmailTrackersForUser(this.user).toPromise().then((emailTrackers) => {
      console.log(emailTrackers)
      this.emailTrackers = emailTrackers;
    });
  }

  showViewEmailModal(soloEmailId) {
    let sub = this.fb.getSoloEmail(soloEmailId).subscribe((email) => {
      this.soloEmail = email;
      sub.unsubscribe();
      this.emailModal.show();
    });
  }
}
