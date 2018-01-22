import {Address} from "./address";
export class Location {
  name: string = '';
  source: string = '';
  phone: string = '';
  fax: string = '';
  email: string = '';
  summary: string = '';
  website: string = '';
  numberOfUnits: string = '';
  software: string = '';
  addedBy: string = '';
  leadStatus: string = '';
  accountExecutiveKey: string = '';
  accountExecutiveKey2: string = '';
  isDoNotContact: boolean = false;
  isDoNotEmail: boolean = false;

  address: Address = new Address();

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
  companyKeys = [];
  peopleKeys = [];
};
