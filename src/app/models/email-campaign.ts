
import {Observable} from "rxjs/Observable";
export class EmailCampaign {
  id: string;
  name: string;
  subject: string;

  emailListKey: string;
  emailTemplateKey: string;

  showUserSignature: boolean;
  hasBeenSent: boolean;

  userWhoSentItKey: string;

  dateCreated: Date;
  dateSent: Date;

  emailSent: string;
  sentToList: Array<any>;

  emailTrackerKeys: Observable<any>;
  emailTrackerViewKeys: Observable<any>;
  shortUrls: Observable<any>;
  shortUrlClicks: Observable<any>;
  views: Observable<any>;

  constructor() {
    this.name = '';
    this.subject = '';
    this.emailListKey = '';
    this.emailTemplateKey = '';
    this.showUserSignature = true;
    this.hasBeenSent = false;
    this.dateCreated = new Date();
  }
}
