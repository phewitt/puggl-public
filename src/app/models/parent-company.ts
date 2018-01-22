import {Address} from "./address";
export class ParentCompany {
  name: string = '';
  phone: string = '';
  email: string = '';
  source: string = '';
  summary: string = '';
  addedBy: string = '';
  address = new Address();
  accountExecutiveKey: string = '';
  accountExecutiveKey2: string = '';
  website: string = '';
  leadStatus: string = '';
  isDoNotContact: boolean = false;
  isDoNotEmail: boolean = false;

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

  companyKeys = [];
  locationKeys = [];
  peopleKeys = [];
};
