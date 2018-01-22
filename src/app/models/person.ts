import {Address} from "./address";
export class Person {
  firstName: string = '';
  lastName: string = '';
  source: string = '';
  phone: string = '';
  workPhone: string = '';
  email: string = '';
  summary: string = '';
  linkedIn: string = '';
  addedBy: string = '';
  leadStatus: string = '';
  title: string = '';
  address = new Address();
  accountExecutiveKey: string = '';
  accountExecutive2Key: string = '';
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

  parentCompanyKeys = [];
  locationKeys = [];
  companyKeys = [];
};
