import {Component, OnInit, ViewChild} from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {isNullOrUndefined, isUndefined} from "util";
import {GoogleCalendarService} from "../../providers/google-calendar.service";
import {Company} from "../../models/company";
import {LoadingServiceProvider} from "../../providers/loading-service";
import {Person} from "../../models/person";
import {Location} from "../../models/location";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";

import * as localforage from "localforage";

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  email: string = '';

  googleEmail: string = '';
  googlePassword: string = '';
  color: string = '';
  googleCalId: string = '';
  googleCalSummary: string = '';

  emailSignature: any = '';

  settingActive = 1;

  importData: any;
  importDataSorted: any;

  options: Object = {
    placeholderText: 'Edit Your Content Here!',
    charCounterCount: false,
    fontSizeDefaultSelection: '14',
    heightMin: 200,
    toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', '|', 'fontFamily', 'fontSize', 'color', 'inlineStyle', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '-', 'insertLink', 'insertImage', 'insertVideo', 'embedly', 'insertFile', 'insertTable', '|', 'emoticons', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting', '|', 'print', 'spellChecker', 'help', 'html', '|', 'undo', 'redo']
  };

  @ViewChild('lgModal') lgModal;
  emailOptions: Object = {
    placeholderText: 'Email body goes here!',
    charCounterCount: true,
    fontSizeDefaultSelection: '14',
    heightMin: 200,
    toolbarButtons: ['bold', 'italic', 'underline', '|', 'fontFamily', 'fontSize', 'color', 'paragraphStyle', '|', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', '-', 'insertLink', 'insertImage', 'embedly', 'insertTable', '|', 'emoticons', 'insertHR', 'selectAll', 'clearFormatting', '|', 'spellChecker', 'help', 'html', '|', 'undo', 'redo']
  };
  testEmail = {
    subject: '',
    useSignature: true,
    signature: '',
    body: '',
    to: '',
    sentBy: '',
    googleEmail: '',
    email: '',
    fromName: '',
    googlePassword: ''
  };

  peopleCount = 0;
  companyCount = 0;
  locationCount = 0;
  locationsWithNoActivity = 0;
  locationsWithNoTodos = 0;

  removeDate = new Date('2017-11-17');
  locations: any;
  companies: any;
  people: any;
  constructor(
    private fb: FirebaseService,
    public gcal: GoogleCalendarService,
    private gcf: GCFMiddlewareService,
    private loading: LoadingServiceProvider
  ) { }

  ngOnInit() {
    localforage.getItem('locations').then((locations:any) => {
      this.locations = locations;
    });
    localforage.getItem('companies').then((companies:any) => {
      this.companies = companies;
    });
    localforage.getItem('people').then((people:any) => {
      this.people = people;
    });
    this.removeDate.setHours(4)
    console.log(this.removeDate)
    setTimeout(() => {
     this.fb.getUserData().valueChanges().subscribe((data: any) => {
        if(!isNullOrUndefined(data)) {
          this.firstName = data.firstName;
          this.lastName = data.lastName;
          this.email = data.email;

          if(!isNullOrUndefined(data.googleEmail)) {
            this.googleEmail = data.googleEmail;
          }
          if(!isNullOrUndefined(data.googlePassword)) {
            this.googlePassword = atob(data.googlePassword);
          }
          if(!isNullOrUndefined(data.emailSignature)) {
            this.emailSignature = data.emailSignature;
          }
        }
      });
    }, 1000)
  }

  clearCache(type) {
    this.loading.showLoading();
    if(type == 'companies') {
      let sub = this.fb.getCompanies().subscribe((companies) => {
        sub.unsubscribe();
        this.loading.hideLoading();
      });
    }
    if(type == 'people') {
      let sub2 =  this.fb.getPeople().subscribe((people) => {
        sub2.unsubscribe();
        this.loading.hideLoading();
      });
    }
    localforage.clear().then(() => {
      // Run this code once the database has been entirely deleted.
      console.log('Database is now empty.');
      this.fb.setIndexes();
      if(type != 'companies' && type != 'people') {
        this.loading.hideLoading();
      }
    }).catch(function(err) {
      // This code runs if there were any errors
      console.log(err);
    });
  }

  resetPassword() {
    this.fb.resetPassword(this.email).then((data)=> {
      this.fb.openSnackBar('Password Reset Email Sent.');
    }).catch(e => {
      this.fb.openSnackBar('Error');
    });
  }

  async removeAllItemsWithNoActivityOrTodos(type) {
    this.loading.showLoading();
    if(type == 'locations') {
      for(let item of this.locations) {
        if(this.compareTime(item.dateAdded, this.removeDate) && item.accountExecutiveKey == '') {
          await this.getActivityForAType(item.id, type);
        }
      }
    }
    else if(type == 'people') {
      for(let item of this.people) {
        if(this.compareTime(item.dateAdded, this.removeDate) && item.accountExecutiveKey == '') {
          await this.getActivityForAType(item.id, type);
        }
      }
    }
    else if(type == 'companies') {
      for(let item of this.companies) {
        if(this.compareTime(item.dateAdded, this.removeDate) && item.accountExecutiveKey == '') {
          await this.getActivityForAType(item.id, type);
        }
      }
    }
    this.loading.hideLoading();
    console.log('done')
  }

  compareTime(time1, time2) {
    return new Date(time1) > new Date(time2); // true if time1 is later
  }

  async getActivityForAType(id, type) {
    await this.gcf.getTodosForAType(id, type).toPromise().then((todos:any) => {
      console.log('todos: ', todos.length);
      console.log(todos)
      if(todos.length == 0) {
        this.locationsWithNoTodos++;
        this.gcf.getActivityForAItem(id, type).toPromise().then((activity:any) => {
          if(activity.length == 0) {
            this.locationsWithNoActivity++;
            this.gcf.removeAnItem(id, type).toPromise().then((rt:any) => {
              console.log('removed successfully');
            });
          }
          console.log('activity: ', activity.length);
        });
      }
    });

  }

  async importCompaniesFunction() {
    this.loading.showLoading();
    for(let item of JSON.parse(this.importData)) {
      // await this.addTask(item);
      // await this.addSoftware(item);
      // await this.addSource(item);
      await this.addCompany(item);
    }
    this.loading.hideLoading();
    console.log('done')
  }

  async importPeopleFunction() {
    this.loading.showLoading();
    for(let item of JSON.parse(this.importData)) {
      // await this.addTask(item);
      // await this.addSoftware(item);
      await this.addSource(item);
      if(item['Name'] == 'Unknown') {
        await this.addLocation(item);
      }
      else {
        await this.addPerson(item);
      }
    }
    this.loading.hideLoading();
    console.log('done')
  }

  async importPeopleMailchimpFunction() {
    this.loading.showLoading();
    for(let item of JSON.parse(this.importData)) {
      // await this.addSource(item);
      await this.addPersonMailchimp(item);
    }
    this.loading.hideLoading();
    console.log('done')
  }

  async importPeopleSSA() {
    this.loading.showLoading();
    for(let item of JSON.parse(this.importData)) {
      await this.addCompanySSA(item);
    }
    this.loading.hideLoading();
    console.log('done')
  }

  async addCompanySSA(i) {
    let c = new Company();
    c.name = i['businessName'];
    c.type = i['type'];
    c.address.street = i['address'];
    c.address.street2 = i['address2'];
    c.address.city = i['city'];
    c.address.state = i['state'];
    c.address.zip = i['zip'];
    c.phone = i['phone'];
    c.email = i['email'];
    c.fax = i['fax'];
    c.website = i['website'];
    if(c.website != '') {
      if (c.website.indexOf('https://') == -1 && c.website.indexOf('http://') == -1)
      {
        c.website = 'http://' + c.website;
      }
    }
    c.dateUpdated = new Date();
    c.dateAdded = new Date();
    // if (!isUndefined(this.fb.softwareIndexName[i['Software']])) {
    //   c.software = this.fb.softwareIndexName[i['Software']];
    // }
    // else {
    //   c.software = '';
    // }
    c.source = 'aTLiGjVKNVcaVooEh09C';
    c = JSON.parse(JSON.stringify(c));
    c.dateAdded = new Date(c.dateAdded);
    c.dateUpdated = new Date(c.dateUpdated);
    c.addedBy = this.fb.auth.auth.currentUser.uid;
    if(i.people.length > 0) {
      for(let person of i.people) {
        return await this.addPersonSSA(i, person).then((p:any) => {
          c.peopleKeys.push(p.id);
          return this.fb.fs.collection('companies').add(c).then((data) => {
            this.companyCount++;
            this.fb.addItem(p.id, 'people', 'companyKeys', data.id);
          });
        });
      }
    }
    else {
        return await this.fb.fs.collection('companies').add(c).then((data) => {
          this.companyCount++;
          // this.fb.addItem(this.fb.companiesNameIndexByName[i['Company']], 'companies', 'peopleKeys', data.id);
        }).catch(e => {
        });
    }

    return await this.fb.fs.collection('companies').add(c);
  }

  async addPersonSSA(i, person) {
    let c = new Person();
    c.firstName = person['firstName'];
    c.lastName = person['lastName'];
    c.workPhone = i['phone'];
    c.title = person['title'];
    c.address.city = i['city'];
    c.address.state = i['state'];
    c.address.street = i['address'];
    c.address.street2 = i['address2'];
    c.address.zip = i['zip'];
    c.email = person['email'];
    c.dateUpdated = new Date();
    c.dateAdded = new Date();
    c.source = 'aTLiGjVKNVcaVooEh09C';

    c = JSON.parse(JSON.stringify(c));
    c.dateAdded = new Date(c.dateAdded);
    c.dateUpdated = new Date(c.dateUpdated);
    c.addedBy = this.fb.auth.auth.currentUser.uid;
    this.peopleCount++;
    return await this.fb.fs.collection('people').add(c).catch(e => {
      console.log('Error adding company: ', c.firstName + ' ' + c.lastName);
    });
  }


  async addTask(item) {
      if(item['Next Task'] != '') {
        // console.log(this.fb.activityTypesIndexName[item['Next Task']])
        if(isUndefined(this.fb.activityTypesIndexName[item['Next Task']])) {
          await this.fb.fs.collection('default/data/activities').add({name: item['Next Task']}).then((data) => {
            this.fb.activityTypesIndexName[item['Next Task']] = data.id;
            console.log(item['Next Task'])
          })
        }
      }
  }

  async addSoftware(item) {
      if(item['Software'] != '') {
        // console.log(this.fb.activityTypesIndexName[item['Next Task']])
        if(isUndefined(this.fb.softwareIndexName[item['Software']])) {
          await this.fb.fs.collection('default/data/softwares').add({name: item['Software']}).then((data) => {
            this.fb.softwareIndexName[item['Software']] = data.id;
            console.log(item['Software'])
          })
        }
      }
  }

  async addSource(item) {
    if(item['Source'] != '') {
      // console.log(this.fb.activityTypesIndexName[item['Next Task']])
      if(item['Source'] == 'TX') {
        item['Source'] = 'TXSSA';
      }
      else if(item['Source'] == 'PA') {
        item['Source'] = 'PASSA';
      }
      else if(item['Source'] == 'NC') {
        item['Source'] = 'NCSSA';
      }
      else if(item['Source'] == 'MO') {
        item['Source'] = 'MOSSA';
      }
      else if(item['Source'] == 'LA') {
        item['Source'] = 'LASSA';
      }
      else if(item['Source'] == 'IL') {
        item['Source'] = 'ILSSA';
      }
      else if(item['Source'] == 'FL') {
        item['Source'] = 'FLSSA';
      }
      if(isUndefined(this.fb.sourceIndexName[item['Source']])) {
        await this.fb.fs.collection('default/data/sources').add({name: item['Source']}).then((data) => {
          this.fb.sourceIndexName[item['Source']] = data.id;
          console.log(item['Source'])
        })
      }
    }
  }

  async addCompany(i) {
    let c = new Company();
    c.name = i['Name'];
    c.phone = i['Phone'];
    c.address.city = i['City'];
    c.address.state = i['State'];
    c.address.street = i['Address'];
    c.email = i['Email'];
    c.address.zip = i['Postal Code'];
    c.summary = i['Summary'];
    c.website = i['Web'];
    if(c.website != '') {
      if (c.website.indexOf('https://') == -1 && c.website.indexOf('http://') == -1)
      {
        c.website = 'http://' + c.website;
      }
    }
    c.dateUpdated = new Date(i['Updated']);
    c.dateAdded = new Date();
    c.numberOfLocations = i['# of Facilities'];
    c.numberOfUnits = i['# of Units'];
    c.webCompany = i['Web Company'];
    if(!isUndefined(this.fb.softwareIndexName[i['Software']])) {
      c.software = this.fb.softwareIndexName[i['Software']];
    }
    else {
      c.software = '';
    }
    if(!isUndefined(this.fb.sourceIndexName[i['Source']])) {
      c.source = this.fb.sourceIndexName[i['Source']];
    }
    else {
      c.source = '';
    }
    c = JSON.parse(JSON.stringify(c));
    c.dateAdded = new Date(c.dateAdded);
    c.dateUpdated = new Date(c.dateUpdated);
    c.addedBy = this.fb.auth.auth.currentUser.uid;
    return await this.fb.fs.collection('companies').add(c).then((data) => {
      // if(i['Next Task'] != '') {
      //   this.addTodo(i, data.id);
      // }
      this.companyCount++;
    }).catch(e => {
      console.log('Error adding company: ', c.name);
    });
  }

  async addCompanyMailChimp(i) {
    let c = new Company();
    c.name = i['Company'];
    c.phone = i['Work Phone'];
    c.address.city = i['Work City'];
    c.address.state = i['Work State'];
    c.address.street = i['Work Address'];
    c.address.street2 = i['Work Address 2'];
    c.email = i['Email'];
    c.address.zip = i['Work Postal Code'];
    c.summary = i['Summary'];
    c.website = i['Website'];
    if(c.website != '') {
      if (c.website.indexOf('https://') == -1 && c.website.indexOf('http://') == -1)
      {
        c.website = 'http://' + c.website;
      }
    }
    c.dateUpdated = new Date(i['Updated']);
    c.dateAdded = new Date();
    if (!isUndefined(this.fb.softwareIndexName[i['Software']]) && i['Software'] != '') {
      c.software = this.fb.softwareIndexName[i['Software']];
    }
    else {
      c.software = '';
    }
    if (!isUndefined(this.fb.sourceIndexName[i['Source']])) {
      c.source = this.fb.sourceIndexName[i['Source']];
    }
    else {
      c.source = '';
    }
    c = JSON.parse(JSON.stringify(c));
    c.dateAdded = new Date(c.dateAdded);
    c.dateUpdated = new Date(c.dateUpdated);
    c.addedBy = this.fb.auth.auth.currentUser.uid;
    this.companyCount++;

    return await this.fb.fs.collection('companies').add(c);
  }

  async addLocationMailChimp(i, companyId, personId = 0) {
    let c = new Location();
    c.name = i['Company'] + ' - ' + i['Location'];
    c.phone = i['Work Phone'];
    c.address.city = i['Work City'];
    c.address.state = i['Work State'];
    c.address.street = i['Work Address'];
    c.address.street2 = i['Work Address 2'];
    c.email = i['Email'];
    c.address.zip = i['Work Postal Code'];
    c.summary = i['Summary'];
    c.website = i['Website'];
    if(c.website != '') {
      if (c.website.indexOf('https://') == -1 && c.website.indexOf('http://') == -1)
      {
        c.website = 'http://' + c.website;
      }
    }
    c.dateUpdated = new Date(i['Updated']);
    c.dateAdded = new Date();
    if (!isUndefined(this.fb.softwareIndexName[i['Software']])) {
      c.software = this.fb.softwareIndexName[i['Software']];
    }
    else {
      c.software = '';
    }
    if (!isUndefined(this.fb.sourceIndexName[i['Source']])) {
      c.source = this.fb.sourceIndexName[i['Source']];
    }
    else {
      c.source = '';
    }
    c = JSON.parse(JSON.stringify(c));
    c.dateAdded = new Date(c.dateAdded);
    c.dateUpdated = new Date(c.dateUpdated);
    c.addedBy = this.fb.auth.auth.currentUser.uid;
    this.locationCount++;
    c.companyKeys.push(companyId);
    c.peopleKeys.push(personId);

    return await this.fb.fs.collection('locations').add(c).then((location:any) => {
      this.fb.addItem(companyId, 'companies', 'locationKeys', location.id);
      if(personId != 0) {
        this.fb.addItem(personId, 'people', 'locationKeys', location.id);
      }
    });
  }

  async addPersonMailchimp(i) {
    let c = new Person();
    c.firstName = i['First Name'];
    c.lastName = i['Last Name'];
    c.workPhone = i['Work Phone'];
    c.address.city = i['Work City'];
    c.address.state = i['Work State'];
    c.address.street = i['Work Address'];
    c.address.street2 = i['Work Address 2'];
    c.address.zip = i['Work Postal Code'];
    c.email = i['Email'];
    c.summary = i['Summary'];
    c.dateUpdated = new Date(i['Updated']);
    c.dateAdded = new Date();
    if(!isUndefined(this.fb.sourceIndexName[i['Source']])) {
      c.source = this.fb.sourceIndexName[i['Source']];
    }
    else {
      c.source = '';
    }

    c = JSON.parse(JSON.stringify(c));
    c.dateAdded = new Date(c.dateAdded);
    c.dateUpdated = new Date(c.dateUpdated);
    c.addedBy = this.fb.auth.auth.currentUser.uid;

    if(i['isLocation'] == 0 || i['isLocation'] == "0") {
      if(isUndefined(this.fb.companiesNameIndexByName[i['Company']])) {
        return await this.addCompanyMailChimp(i).then((company:any) => {
          this.fb.companiesNameIndexByName[i['Company']] = company.id;
          c.companyKeys.push(company.id);
          if(c.firstName != '') {
            return this.fb.fs.collection('people').add(c).then((data) => {
              this.peopleCount++;
              this.fb.addItem(this.fb.companiesNameIndexByName[i['Company']], 'companies', 'peopleKeys', data.id);
            }).catch(e => {
            });
          }
        });
      }
      else {
        c.companyKeys.push(this.fb.companiesNameIndexByName[i['Company']]);
        if(c.firstName != '') {
          return await this.fb.fs.collection('people').add(c).then((data) => {
            this.peopleCount++;
            this.fb.addItem(this.fb.companiesNameIndexByName[i['Company']], 'companies', 'peopleKeys', data.id);
          }).catch(e => {
          });
        }
        else {
          return true;
        }
      }
    }
    else if(i['isLocation'] == 1) {
      if(isUndefined(this.fb.companiesNameIndexByName[i['Company']])) {
        return await this.addCompanyMailChimp(i).then((company:any) => {
          this.fb.companiesNameIndexByName[i['Company']] = company.id;
          c.companyKeys.push(company.id);
          if(c.firstName != '') {
            return this.fb.fs.collection('people').add(c).then((data: any) => {
              this.addLocationMailChimp(i, company.id, data.id);
              this.peopleCount++;
              this.fb.addItem(this.fb.companiesNameIndexByName[i['Company']], 'companies', 'peopleKeys', data.id);
            }).catch(e => {
            });
          }
          else {
            this.addLocationMailChimp(i, company.id);
          }
        });
      }
      else {
        c.companyKeys.push(this.fb.companiesNameIndexByName[i['Company']]);
        if(c.firstName != '') {
          return await this.fb.fs.collection('people').add(c).then((data:any) => {
            this.addLocationMailChimp(i, this.fb.companiesNameIndexByName[i['Company']], data.id);
            this.peopleCount++;
            this.fb.addItem(this.fb.companiesNameIndexByName[i['Company']], 'companies', 'peopleKeys', data.id);
          }).catch(e => {
          });
        }
        else {
          this.addLocationMailChimp(i, this.fb.companiesNameIndexByName[i['Company']]);
          return true;
        }
      }
    }
  }

  async addPerson(i) {
    let c = new Person();
    c.firstName = i['First Name'];
    c.lastName = i['Last Name'];
    c.workPhone = i['Work Phone'];
    c.phone = i['Mobile'];
    c.address.city = i['Work City'];
    c.address.state = i['Work State'];
    c.address.street = i['Work Address'];
    c.address.street2 = i['Work Address 2'];
    c.address.zip = i['Work Postal Code'];
    c.email = i['Email'];
    c.summary = i['Summary'];
    c.title = i['Title'];
    c.dateUpdated = new Date(i['Updated']);
    c.dateAdded = new Date();
    c.companyKeys.push(this.fb.companiesNameIndexByName[i['Company']]);
    if(!isUndefined(this.fb.sourceIndexName[i['Source']])) {
      c.source = this.fb.sourceIndexName[i['Source']];
    }
    else {
      c.source = '';
    }
    c = JSON.parse(JSON.stringify(c));
    c.dateAdded = new Date(c.dateAdded);
    c.dateUpdated = new Date(c.dateUpdated);
    c.addedBy = this.fb.auth.auth.currentUser.uid;
    return await this.fb.fs.collection('people').add(c).then((data) => {
      this.peopleCount++;
      this.fb.addItem(this.fb.companiesNameIndexByName[i['Company']], 'companies', 'peopleKeys', data.id);
    }).catch(e => {
    });
  }

  async addLocation(i) {
    let c = new Location();
    c.name = i['Company'];
    c.phone = i['Work Phone'];
    c.address.city = i['Work City'];
    c.address.state = i['Work State'];
    c.address.street = i['Work Address'];
    c.address.street2 = i['Work Address 2'];
    c.address.zip = i['Work Postal Code'];
    c.email = i['Email'];
    c.summary = i['Summary'];
    c.dateUpdated = new Date(i['Updated']);
    c.dateAdded = new Date();
    c.companyKeys.push(this.fb.companiesNameIndexByName[i['Company']]);
    if(!isUndefined(this.fb.sourceIndexName[i['Source']])) {
      c.source = this.fb.sourceIndexName[i['Source']];
    }
    else {
      c.source = '';
    }
    c = JSON.parse(JSON.stringify(c));
    c.dateAdded = new Date(c.dateAdded);
    c.dateUpdated = new Date(c.dateUpdated);
    c.addedBy = this.fb.auth.auth.currentUser.uid;
    return await this.fb.fs.collection('locations').add(c).then((data) => {
      this.companyCount++;
      this.fb.addItem(this.fb.companiesNameIndexByName[i['Company']], 'companies', 'locationKeys', data.id);
    }).catch(e => {
    });
  }

  async addTodo(i, key) {
    let todo: {
      id?: string,
        title?: string,
        activityTypeKey?: string,
        assignToUserKey?: string,
        assignTo?: string,
        dueDate?: Date,
        dueDateEnd?: Date,
        description?: string,
        associateToType?: string,
        associateToKey?: string,
        gCalUserInvites?: Array<any>,
        gCalReminderType?: string,
        gCalReminderTime?: {},
        gCalIsReminder?: boolean,
        gCalEventId?: string,
        complete?: boolean,
        dateAdded?: Date,
        addToGoogleCal?: boolean
    } = {};

    todo.activityTypeKey = this.fb.activityTypesIndexName[i['Next Task']];
    todo.assignToUserKey = 'NGdwSzn2TXRURhH58efuSlt2WCA2';
    todo.associateToKey = key;
    todo.associateToType = 'companies';
    todo.complete = false;
    todo.dateAdded = new Date();
    todo.dueDate = new Date(i['Next Task Due']);
    todo.dueDateEnd = new Date(i['Next Task Due']);
    todo.gCalIsReminder = false;
    todo.title = i['Next Task'];
    todo.description = '';
    await this.fb.fs.collection('todos').add(todo).then((d) => {

    }).catch(e => {
      console.log('Error adding todo: ', key);
    });;
  }

  gcalSignIn() {
    this.gcal.login();
  }

  gcalSignOut() {
    this.gcal.logout();
  }

  saveUserData() {
    let data = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      googleEmail: this.googleEmail,
      googlePassword: btoa(this.googlePassword),
      emailSignature: this.emailSignature
    };

    this.fb.saveUserData(data).then(() => {
      this.fb.openSnackBar('Data saved.');
    });
  }

  setSettingActive(num) {
    this.settingActive = num;
  }

  showSendTestEmailModal() {
    this.lgModal.show();
  }

  sendTestEmail() {
    if(this.testEmail.subject != '' && this.testEmail.body != '' && this.testEmail.to != '') {
      if(this.testEmail.useSignature == true) {
        this.testEmail.signature = this.emailSignature;
      }
      this.testEmail.sentBy = this.fb.auth.auth.currentUser.uid;
      this.testEmail.googleEmail = this.googleEmail;
      this.testEmail.email = this.email;
      this.testEmail.googlePassword = btoa(this.googlePassword);
      this.testEmail.fromName = this.firstName + ' ' + this.lastName;
      this.fb.addTestEmail(this.testEmail).then(() => {
        this.lgModal.hide();
        this.fb.openSnackBar('Test email Sent.');
      }).catch(e => {
        this.fb.openSnackBar('Error');
      });
    }
  }
}
