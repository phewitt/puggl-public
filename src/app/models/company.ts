import {Address} from "./address";
export class Company {
  name: string = '';
  source: string = '';
  phone: string = '';
  fax: string = '';
  email: string = '';
  summary: string = '';
  website: string = '';
  type: string = '';
  numberOfUnits: string = '';
  numberOfLocations: string = '';
  software: string = '';
  addedBy: string = '';
  webCompany: string = '';
  leadStatus: string = '';
  accountExecutiveKey: string = '';
  accountExecutiveKey2: string = '';
  isDoNotContact: boolean = false;
  isCustomer: boolean = false;
  isDoNotEmail: boolean = false;

  address = new Address();

  dateAdded: Date = new Date();
  dateUpdated: Date = new Date();

  id: string;
  cacheId: number;

  lastActivityDate: Date;
  lastActivityTypeKey: string;
  lastActivityPostedByKey: string;

  nextTodoDate: Date;
  nextTodoTypeKey: string;
  nextTodoUserKey:string;

  parentCompanyKeys = [];
  locationKeys = [];
  peopleKeys = [];
};
