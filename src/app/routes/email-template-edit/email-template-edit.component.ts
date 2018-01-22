import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FirebaseService} from "../../providers/firebase.service";
import {LoadingServiceProvider} from "../../providers/loading-service";

declare var $: any;

@Component({
  selector: 'app-email-template-edit',
  templateUrl: './email-template-edit.component.html',
  styleUrls: ['./email-template-edit.component.scss']
})
export class EmailTemplateEditComponent implements OnInit {
  emailTemplateKey: string;

  emailTemplate: {
    title?: string,
    email?: any,
    id?: any,
    dateCreated?: Date,
    dateUpdated?: Date,
  } = {};

  isNew = false;
  regex = /\href="(http[^"]*)"/g;
  str = `<p>Hey [FirstName],</p><p>Hey [FullName],</p><p>Hey [Email],</p><p><span style='color: rgb(0, 0, 0); font-family: "Source Sans Pro", sans-serif; font-size: 15px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 200; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;'>Hey [FullName],</span></p><p><span style='color: rgb(0, 0, 0); font-family: "Source Sans Pro", sans-serif; font-size: 15px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 200; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;'><span style='color: rgb(0, 0, 0); font-family: "Source Sans Pro", sans-serif; font-size: 15px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 200; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;'>Hey [Email],</span></span></p><p>Hope you&rsquo;re having a good Wednesday!</p><p>My team and I just got back from the <strong>TSSA trade show</strong>. I was hoping to meet you in person, but you know how those things go.</p><p>We&rsquo;re a startup called StoragePug. We found that most storage facilities are at the mercy of <strong>Sparefoot</strong> when it comes to online rentals and Google results.</p><p>Sometimes when you search your own storage facility you&rsquo;re not even on the first page of results.</p><p><strong>We came up with a solution.</strong></p><p>We build marketing websites with full <strong>SEO optimization</strong>. Built in is a <strong>Rental Station</strong> that allows new customers to sign up and rent straight from your site and current customers to view and pay their bills. No commissions paid to a listing site. You get to keep it <strong>all</strong>.</p><p>StoragePug integrates directly with <strong>Sitelink</strong>, it&rsquo;s secure, and it&rsquo;s free to try for 2 weeks.</p><p><a href="https://storagepug.com/story"><img src="https://i.froala.com/download/ddc1d006b6e6c5c0bf8cbbb9a9257c6dcd7e939a.jpg?1509554096" style="width: 500px;" class="fr-fic fr-dib"></a></p><p>I&rsquo;d love to tell you more if you&rsquo;d want to hop on a call this week.</p><p>You can also check out <a href="https://storagepug.com" rel="noopener noreferrer" target="_blank"><strong>our site</strong></a> for more info.</p><p>Hope to hear from you,</p><p>[MyFullName]</p><p>[MyFirstName]</p><p>[MyEmail]</p>`;
  data: any;

  public options: Object = {
    placeholderText: 'Edit Your Content Here!',
    charCounterCount: false,
    fontSizeDefaultSelection: '14'
  };

  constructor(
    private route: ActivatedRoute,
    public fb: FirebaseService,
    private loading: LoadingServiceProvider,
    private router: Router
  ) { }

  ngOnInit() {
    let m;

    let replaceData = [];

    while ((m = this.regex.exec(this.str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === this.regex.lastIndex) {
        this.regex.lastIndex++;
      }

      m.forEach((match, groupIndex) => {
        console.log(`Found match, group ${groupIndex}: ${match} : index- ${this.regex.lastIndex}`);
        if(groupIndex == 0) {
          this.data = {
            0: match,
            1: '',
            shortUrl: '',
            index: this.regex.lastIndex
          }
        }
        else {
          this.data[1] = match;
          replaceData.push(this.data);
          this.data = {
            0: '',
            1: '',
            shortUrl: '',
            index: ''
          };
        }
      });
    }
    // console.log(replaceData)

    this.route.params.subscribe((params) => {
      this.emailTemplateKey = params['emailTemplateKey'];

      if(this.emailTemplateKey == 'new') {
        this.isNew = true;
        this.emailTemplate.title = '';
        this.emailTemplate.email = '';
        this.emailTemplate.dateCreated = new Date();
        this.emailTemplate.dateUpdated = new Date();
      }
      else {
        this.isNew = false;
        this.fb.getEmailTemplate(this.emailTemplateKey).snapshotChanges().map(a => {
          const data = a.payload.data();
          const id = a.payload.id;
          return {id, ...data};
        }).subscribe((emailTemplate: any) => {
          this.emailTemplate = emailTemplate;
        })
      }
    });
  }


  saveEmailTemplate() {
    this.loading.showLoading();
    this.fb.addEmailTemplate(JSON.parse(JSON.stringify(this.emailTemplate))).then((rt) => {
      this.fb.openSnackBar('Email template saved Successfully');
      this.loading.hideLoading();
      this.router.navigate(['/email-templates/'+rt.id]);
    })
      .catch((e) => {
        this.loading.hideLoading();
        this.fb.openSnackBar('Error');
      });
  }

  updateEmailTemplate() {
    this.loading.showLoading();
    this.emailTemplate.dateUpdated = new Date();
    this.fb.updateEmailTemplate(JSON.parse(JSON.stringify(this.emailTemplate))).then((rt) => {
      this.fb.openSnackBar('Email template saved Successfully');
      this.loading.hideLoading();
    })
      .catch((e) => {
        this.loading.hideLoading();
        this.fb.openSnackBar('Error');
      });
  }

}
