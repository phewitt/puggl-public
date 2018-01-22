import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {FirebaseService} from "../../providers/firebase.service";
import {EmailCampaign} from "../../models/email-campaign";
import {LoadingServiceProvider} from "../../providers/loading-service";
import {Router} from "@angular/router";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";

@Component({
  selector: 'app-email-campaigns',
  templateUrl: './email-campaigns.component.html',
  styleUrls: ['./email-campaigns.component.scss']
})
export class EmailCampaignsComponent implements OnInit {
  public emailCampaigns: Observable<any>;
  @ViewChild('lgModal') lgModal;
  emailCampaign = new EmailCampaign();

  constructor(
    public fb: FirebaseService,
    private loading: LoadingServiceProvider,
    private router: Router,
    private gcf: GCFMiddlewareService
  ) { }

  ngOnInit() {
    this.gcf.getEmailCampaigns().toPromise().then((emailCampaigns:any) => {
      this.emailCampaigns = emailCampaigns;
      console.log(this.emailCampaigns)
    });

  }

  newEmailCampaign() {
    this.lgModal.show();
  }

  createNewCampaign() {
    if(this.emailCampaign.name != '') {
      this.loading.showLoading();
      this.emailCampaign.userWhoSentItKey = this.fb.auth.auth.currentUser.uid;

      let sub = this.fb.getEmailCampaignCounter().valueChanges().subscribe((counter: any) => {
        let ec = JSON.parse(JSON.stringify(this.emailCampaign));
        ec.dateCreated = new Date();
        console.log(ec)
        console.log(counter)
        this.fb.addEmailCampaign(ec, counter.seq).then((rt) => {
          this.fb.openSnackBar('Email template saved Successfully');
          sub.unsubscribe();
          this.fb.setEmailCampaignCounter(Number(counter.seq)+1);
          this.loading.hideLoading();
          this.router.navigate(['/email-campaigns/' + counter.seq]);
        })
          .catch((e) => {
            this.loading.hideLoading();
            this.fb.openSnackBar('Error');
          });
      });
    }
  }

}
