import {EmailListItem} from "./email-list-item";

export class EmailList {
  dateCreated: Date;
  dateUpdated: Date;
  name: string;
  description: string;

  items: Array<EmailListItem>;

  peopleIndex = {};
  locationIndex = {};
  companyIndex = {};
  parentCompanyIndex = {};

  constructor() {
    this.items = [];
    this.dateUpdated = new Date();
    this.dateCreated = new Date();
    this.description = '';
    this.name = '';
  }
}
