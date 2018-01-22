import {Injectable} from '@angular/core';
import {AngularFireAuth} from "angularfire2/auth";
import {Router} from "@angular/router";
import {AngularFirestore} from "angularfire2/firestore";
import {Observable} from "rxjs/Observable";
import {Address} from "../models/address";
import {MatSnackBar} from "@angular/material";
import {isNullOrUndefined, isUndefined} from "util";
import {EmailList} from "../models/email-list";
import 'rxjs/add/observable/combineLatest';
import {MessagingService} from "./messaging.service";
import 'rxjs/add/operator/toPromise';
import {GCFMiddlewareService} from "./gcfmiddleware.service";
import {Lead} from "../models/lead";

import * as localforage from "localforage";

@Injectable()
export class FirebaseService {
  isLoggedIn: boolean = false;
  error: string;
  uid: string;

  sources = [];
  relationRoles: Observable<any>;
  softwares = [];

  activityTypesIndex = {};
  activityTypesIndexName = {};
  sourceIndex = {};
  sourceIndexName = {};
  softwareIndex = {};
  softwareIndexName = {};
  relationIndex = {};
  shortUrlIndex = {};
  searchFields = [];

  peopleNameIndex = {};
  peopleNameArray = [];
  locationsNameIndex = {};
  locationsNameArray = [];
  companiesNameIndex = {};
  companiesNameArray = [];
  companiesNameIndexByName = {};
  parentCompaniesNameIndex = {};
  parentCompaniesNameArray = [];
  emailListIndex = {};
  emailTemplateIndex = {};
  emailCampaignIndex = {};
  userIndex = {};
  userArray = [];
  dealStagesArray = [];
  dealStagesIndex = {};

  emailList: EmailList;

  hideActivity = false;
  hideRecentActivity = false;

  cities: string[] = [];

  showCompleteTodos = false;
  showOnlyMyTodos = false;

  sidebarForm: string;
  sidebarAddress: Address = new Address();
  sidebarIsEdit: boolean = false;
  sidebarData: any;
  sidebarIsAdd: boolean = false;
  sidebarAddToType: string;
  sidebarAddToTypeData: any;

  weekStart = new Date();

  user: any;

  constructor(
    public auth: AngularFireAuth,
    public fs: AngularFirestore,
    private router: Router,
    private snackBar: MatSnackBar,
    private gcf: GCFMiddlewareService,
    private msgService: MessagingService,
  ) {
    this.weekStart.setDate(this.weekStart.getDate() - 7);
    this.auth.authState.subscribe((auth) => {
      if(auth) {
        this.isLoggedIn = true;
        this.uid = auth.uid;
        this.msgService.getPermission();
        let sub = this.getUserData().valueChanges().subscribe((data: any) => {
          this.user = data;
          sub.unsubscribe();
        });
      }
      else {
        this.isLoggedIn = false;
        this.router.navigate(['login']);
      }
    });

    this.setDefaultData();
  }

  setDefaultData() {
    this.setSoftwareData();
    this.setRelationData();
    this.setSourcesData();
    this.setActivityTypes();
    this.setIndexes();

    this.fs.collection('default/data/cities', ref => ref.orderBy('name') ).stateChanges()
      .subscribe(cities => {
        cities.forEach(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          this.cities.push(data.name);
          return { id, ...data };
        });
      });
  }

  setPeopleIndex(isSearch = false) {
    this.gcf.getPeople().toPromise().then((people:any) => {
      localforage.setItem('people', people);
        console.log('people cache');
      this.peopleNameArray = [];
      for (let p of people) {
          this.peopleNameArray.push({label: p.firstName + ' ' + p.lastName, value: p.id});
          this.peopleNameIndex[p.id] = {
            name: p.firstName + ' ' + p.lastName,
            email: p.email,
            phone: p.phone,
            city: p.address.city,
            state: p.address.state,
            software: '',
            website: ''
          };
          if (isSearch == true) {
            this.searchFields.push({
              id: p.id,
              name: p.firstName + ' ' + p.lastName,
              link: `/people/${p.id}`,
              group: 'People'
            });
          }
        }
    });
  }

  setLocationIndex(isSearch = false) {
    this.gcf.getLocations().toPromise().then((locations:any) => {
      localforage.setItem('locations', locations);
      console.log('location cache');
      this.locationsNameArray = [];
      for(let l of locations) {
        this.locationsNameArray.push({label: l.name, value: l.id});
        this.locationsNameIndex[l.id] = {
          name: l.name,
          email: l.email,
          phone: l.phone,
          city: l.address.city,
          state: l.address.state,
          software: l.software,
          website: l.website
        };
        if(isSearch == true) {
          this.searchFields.push({
            id: l.id,
            name: l.name,
            link: `/locations/${l.id}`,
            group: 'Locations'
          });
        }
      }
    });
  }

  setCompanyIndex(isSearch = false) {
    this.gcf.getCompanies().toPromise().then((companies:any) => {
      localforage.setItem('companies', companies);
      this.companiesNameArray = [];
      console.log('company cache');
      for(let l of companies) {
        this.companiesNameArray.push({label: l.name, value: l.id});
        this.companiesNameIndex[l.id] = {
          name: l.name,
          email: l.email,
          phone: l.phone,
          city: l.address.city,
          state: l.address.state,
          software: l.software,
          website: l.website
        };
        this.companiesNameIndexByName[l.name] = l.id;
        if(isSearch == true) {
          this.searchFields.push({
            id: l.id,
            name: l.name,
            link: `/companies/${l.id}`,
            group: 'Companies'
          });
        }
      }
    })

  }

  setParentCompanyIndex(isSearch = false) {
    this.gcf.getParentCompanies().toPromise().then((parentCompanies:any) => {
      localforage.setItem('parent_companies', parentCompanies);
      this.parentCompaniesNameArray = [];
      console.log('parent company cache');
      for(let l of parentCompanies) {
        this.parentCompaniesNameArray.push({label: l.name, value: l.id});
        this.parentCompaniesNameIndex[l.id] = {
          name: l.name,
          email: l.email,
          phone: l.phone,
          city: l.address.city,
          state: l.address.state,
          software: l.software,
          website: l.website
        };
        if(isSearch == true) {
          this.searchFields.push({
            id: l.id,
            name: l.name,
            link: `/parent-companies/${l.id}`,
            group: 'Parent Companies'
          });
        }
      }
    });
  }

  setIndexes() {
    localforage.getItem('lastUpdated').then((date:any) => {
      let today = new Date();
      var updateCache = false;
      if(isNullOrUndefined(date)) {
        localforage.setItem('lastUpdated', new Date());
        updateCache = true;
      }
      else if(((today.getTime() - date.getTime())/1000)/60 > 180) {
        console.log('Updating old cache.');
        localforage.setItem('lastUpdated', new Date());
        updateCache = true;
      }
      localforage.getItem('companies').then((companies:any) => {
        if(isNullOrUndefined(companies) || updateCache == true) {
          console.log('no companies cache');
          this.setCompanyIndex(true);
        }
        else {
          for(let l of companies) {
            this.companiesNameArray.push({label: l.name, value: l.id});
            this.companiesNameIndex[l.id] = {
              name: l.name,
              email: l.email,
              phone: l.phone,
              city: l.address.city,
              state: l.address.state,
              software: l.software,
              website: l.website
            };
            this.companiesNameIndexByName[l.name] = l.id;
            this.searchFields.push({
              id: l.id,
              name: l.name,
              link: `/companies/${l.id}`,
              group: 'Companies'
            });
          }
        }
      });
      localforage.getItem('parent_companies').then((parent_companies:any) => {
        if(isNullOrUndefined(parent_companies) || updateCache == true) {
          console.log('no parent_companies cache');
          this.setParentCompanyIndex(true);
        }
        else {
          for(let l of parent_companies) {
            this.parentCompaniesNameArray.push({label: l.name, value: l.id});
            this.parentCompaniesNameIndex[l.id] = {
              name: l.name,
              email: l.email,
              phone: l.phone,
              city: l.address.city,
              state: l.address.state,
              software: l.software,
              website: l.website
            };
            this.searchFields.push({
              id: l.id,
              name: l.name,
              link: `/parent-companies/${l.id}`,
              group: 'Parent Companies'
            });
          }
        }
      });
      localforage.getItem('locations').then((locations:any) => {
        if(isNullOrUndefined(locations) || updateCache == true) {
          console.log('no locations cache');
          this.setLocationIndex(true);
        }
        else {
          for(let l of locations) {
            this.locationsNameArray.push({label: l.name, value: l.id});
            this.locationsNameIndex[l.id] = {
              name: l.name,
              email: l.email,
              phone: l.phone,
              city: l.address.city,
              state: l.address.state,
              software: l.software,
              website: l.website
            };
            this.searchFields.push({
              id: l.id,
              name: l.name,
              link: `/locations/${l.id}`,
              group: 'Locations'
            });
          }
        }
      });
      localforage.getItem('people').then((people:any) => {
        if(isNullOrUndefined(people) || updateCache == true) {
          console.log('no people cache');
          this.setPeopleIndex(true);
        }
        else {
          for(let p of people) {
            this.peopleNameArray.push({label: p.firstName + ' ' + p.lastName, value: p.id});
            this.peopleNameIndex[p.id] = {name: p.firstName + ' ' + p.lastName, email: p.email, phone: p.phone, city: p.address.city, state: p.address.state};
            this.searchFields.push({
              id: p.id,
              name: p.firstName + ' ' + p.lastName,
              link: `/people/${p.id}`,
              group: 'People'
            });
          }
        }
      });
    });

    this.gcf.getEmailLists().toPromise().then((lists:any) => {
      for(let l of lists) {
        this.emailListIndex[l.id] = {name: l.name, description: l.description};
      }
    });

    this.gcf.getEmailCampaigns().toPromise().then((templates:any) => {
      for(let l of templates) {
        this.emailCampaignIndex[l.id] = {name: l.name};
      }
    });
    this.gcf.getUsers().toPromise().then((templates:any) => {
      for(let l of templates) {
        this.userIndex[l.id] = {name: l.firstName +' '+ l.lastName};
        this.userArray.push({name: l.firstName +' '+ l.lastName, id: l.id, label: l.firstName +' '+ l.lastName, value: l.id});
      }
    });
    this.gcf.getEmailTemplates().toPromise().then((templates:any) => {
      for(let l of templates) {
        this.emailTemplateIndex[l.id] = {name: l.title};
      }
    });
    this.gcf.getShortUrls().toPromise().then((shortUrls:any) => {
      for(let l of shortUrls) {
        this.shortUrlIndex[l.id] = {long_url: l.long_url};
      }
    });
  }

  setSoftwareData() {
    this.softwares = [];
    this.gcf.getSoftwareTypes().toPromise().then((sources:any) => {
      for(let source of sources) {
        this.softwareIndex[source.id] = source.name;
        this.softwareIndexName[source.name] = source.id;
        this.softwares.push({id: source.id, name: source.name, label: source.name, value: source.id});
      }
    });
  }

  setActivityTypes() {
    this.gcf.getActivityTypes().toPromise().then((sources:any) => {
      for(let source of sources) {
        this.activityTypesIndex[source.id] = source.name;
        this.activityTypesIndexName[source.name] = source.id;
      }
    });
    this.dealStagesArray = [];
    this.gcf.getDealStages().toPromise().then((sources:any) => {
      for(let source of sources) {
        this.dealStagesArray.push({name: source.name, id: source.id, label: source.name, value: source.id});
        this.dealStagesIndex[source.id] = source.name;
      }
    });
  }

  setSourcesData() {
    this.sources = [];
    this.gcf.getSources().toPromise().then((sources:any) => {
      for(let source of sources) {
        this.sourceIndex[source.id] = source.name;
        this.sourceIndexName[source.name] = source.id;
        this.sources.push({id: source.id, name: source.name, label: source.name, value: source.id});
      }
    });
  }

  setRelationData() {
    this.fs.collection('default/data/relation-roles', ref => ref.orderBy('name') ).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      }).subscribe((sources: any) => {
      for(let source of sources) {
        this.relationIndex[source.id] = source.name;
      }
    });
  }

  getUsers() {
    return this.fs.collection('users', ref => ref.orderBy('lastName') ).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          const label = data.firstName + ' ' + data.lastName;
          const value = data.email;
          return { id, label, value,...data };
        });
      });
  }

  getActivityTypes() {
    return this.fs.collection('default/data/activities', ref => ref.orderBy('name') ).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }

  getPeople() {
    return this.fs.collection('people', ref => ref.orderBy('lastName')).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          const label = data.firstName + ' ' + data.lastName;
          const value = id;
          return { id, label, value, ...data };
        });
      });
  }



  getPeopleView() {
    return this.fs.collection('people', ref => ref.orderBy('lastName')).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          const label = data.firstName + ' ' + data.lastName;
          const value = id;
          var lastActivity = this.getLastActivity(id, 'Person');
          var nextTodo = this.getNextTodo(id, 'people');
          return { id, label, value, lastActivity, nextTodo, ...data };
        });
      });
  }

  getParentCompanies() {
    return this.fs.collection('parent_companies', ref => ref.orderBy('name')).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          const label = data.name;
          const value = id;
          return { id, label, value, ...data };
        });
      });
  }

  getParentCompaniesView() {
    return this.fs.collection('parent_companies', ref => ref.orderBy('name')).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          const label = data.name;
          const value = id;
          var lastActivity = this.getLastActivity(id, 'Parent Company');
          var nextTodo = this.getNextTodo(id, 'parent_companies');
          return { id, label, value, lastActivity, nextTodo, ...data };
        });
      });
  }

  getCompanies() {
    return this.fs.collection('companies', ref => ref.orderBy('name')).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          const label = data.name;
          const value = id;
          return { id, label, value, ...data };
        });
      });
  }

  getCompaniesView() {
    return this.fs.collection('companies', ref => ref.orderBy('name')).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          const label = data.name;
          const value = id;
          var lastActivity = this.getLastActivity(id, 'Company');
          var nextTodo = this.getNextTodo(id, 'companies');
          return { id, label, value, lastActivity, nextTodo, ...data };
        });
      });
  }

  getLocations() {
    return this.fs.collection('locations', ref => ref.orderBy('name')).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          const label = data.name;
          const value = id;
          return { id, label, value, ...data };
        });
      });
  }

  getLocationsView() {
    return this.fs.collection('locations', ref => ref.orderBy('name')).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          const label = data.name;
          const value = id;
          var lastActivity = this.getLastActivity(id, 'Location');
          var nextTodo = this.getNextTodo(id, 'locations');
          return { id, label, value, lastActivity, nextTodo, ...data };
        });
      });
  }

  getLastActivity(id, type) {
    return this.fs.collection(`activity`, ref => ref.where('postedTo', '==', id).where('postedToType', '==', type).orderBy('date', 'desc').limit(1)).snapshotChanges().map(actions => {
      if(actions.length) {
        const data = actions[0].payload.doc.data();
        const id = actions[0].payload.doc.id;
        return {id, ...data};
      }
    });
  }

  getNextTodo(id, type) {
    return this.fs.collection(`todos`, ref => ref.where('associateToKey', '==', id).where('associateToType', '==', type).where('complete', '==', false).orderBy('dueDate').limit(1)).snapshotChanges().map(actions => {
      if(actions.length) {
        const data = actions[0].payload.doc.data();
        const id = actions[0].payload.doc.id;
        return {id, ...data};
      }
    });
  }

  loginUser(email, password) {
    return this.auth.auth.signInWithEmailAndPassword(email, password);
  }

  resetPassword(email) {
    return this.auth.auth.sendPasswordResetEmail(email);
  }

  logout() {
    return this.auth.auth.signOut();
  }

  addCity(city) {
    return this.fs.collection('default/data/cities').add({name: city});
  }

  sendEmail(email) {
    return this.fs.collection('send_email').add(email);
  }

  saveActivity(activity, data, type, isResetCache = true) {
    activity.postedBy = this.auth.auth.currentUser.uid;

    return this.fs.collection('activity').add(activity).then((rt) => {
      let id = rt.id;
      if(type == 'people') {
        var aType = 'Person';
      }
      else if(type == 'locations') {
        var aType = 'Location';
      }
      else if(type == 'companies') {
        var aType = 'Company';
      }
      else if(type == 'parent_companies') {
        var aType = 'Parent Company';
      }
      this.getLastActivity(data.id, aType).subscribe((la: any) => {
        if(isUndefined(la.date)) {
          data.lastActivityDate = new Date();
        }
        else {
          data.lastActivityDate = la.date;
        }
        data.lastActivityTypeKey = la.type;
        data.lastActivityPostedByKey = la.postedBy;
        this.updateItem(data, type);
      });
      return this.fs.collection(`${type}/${data.id}/activityKeys`).add({
        activity_id: id,
        date: activity.date,
        type: activity.type
      }).then(() => {
        if(isResetCache == true) {
          if(type == 'people') {
            this.setPeopleIndex();
          }
          else if(type == 'locations') {
            this.setLocationIndex();
          }
          else if(type == 'companies') {
            this.setCompanyIndex();
          }
          else if(type == 'parent_companies') {
            this.setParentCompanyIndex();
          }
        }
        // Now add the note to every Object it is a part of.
        if(!isNullOrUndefined(data.parentCompanyKeys)) {
          for(let key of data.parentCompanyKeys) {
            this.fs.collection(`parent_companies/${key}/activityKeys`).add({
              activity_id: id,
              date: activity.date,
              type: activity.type
            }).catch((e) => {
              this.error = e;
            });
          }
        }
        if(!isNullOrUndefined(data.companyKeys)) {
          for(let key of data.companyKeys) {
            this.fs.collection(`companies/${key}/activityKeys`).add({
              activity_id: id,
              date: activity.date,
              type: activity.type
            }).catch((e) => {
              this.error = e;
            });
          }
        }
        if(!isNullOrUndefined(data.peopleKeys)) {
          for(let key of data.peopleKeys) {
            this.fs.collection(`people/${key}/activityKeys`).add({
              activity_id: id,
              date: activity.date,
              type: activity.type
            }).catch((e) => {
              this.error = e;
            });
          }
        }
        if(!isNullOrUndefined(data.locationKeys)) {
          for(let key of data.locationKeys) {
            this.fs.collection(`locations/${key}/activityKeys`).add({
              activity_id: id,
              date: activity.date,
              type: activity.type
            }).catch((e) => {
              this.error = e;
            });
          }
        }
      }).catch((e) => {
        this.error = e;
      });

    }).catch((e) => {
      this.error = e;
    });
  }

  getAllActivity(type, data) {
    let newType = '';
    if(type == 'companies') {
      newType = 'Company';
    }
    else if(type == 'Person') {
      newType = 'Company';
    }
    else if(type == 'parent_companies') {
      newType = 'Parent Company';
    }
    else if(type == 'locations') {
      newType = 'Location';
    }
    // console.log(data.id, newType);
    return this.fs.collection(`activity`, ref => ref.where('postedTo', '==', data.id).where('postedToType', '==', newType).orderBy('date', 'desc') ).snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      });
    });
  }

  updateItem(data, typeName) {
    return this.fs.doc(`${typeName}/${data.id}`).update(data);
  }

  getItem(id, typeName) {
    return this.fs.doc(`${typeName}/${id}`);
  }

  addItem(id, typeName, itemToAddName, item) {
    let sub = this.getItem(id, typeName).snapshotChanges().subscribe((rt) => {
      let data = rt.payload.data();
      data.id = rt.payload.id;
      if(isNullOrUndefined(data[itemToAddName])) {
        data[itemToAddName] = [];
        this.updateItem(data, typeName).then(() => {
        }).catch((e) => {
          this.error = e;
          this.openSnackBar('Error')
        });
      }
      else if(data[itemToAddName].indexOf(item) == -1) {
        data[itemToAddName].push(item);
        this.updateItem(data, typeName).then(() => {
        }).catch((e) => {
          this.error = e;
          this.openSnackBar('Error')
        });
      }
      sub.unsubscribe();
    });
  }

  /**
   *
   * @param itemArray
   * @param itemToAddId
   * @param typeName : parent_companies, companies
   * @param itemToAddName : companyKeys, locationKeys
   */
  addItemsArray(itemArray, itemToAddId, typeName, itemToAddName) {
    if(!isNullOrUndefined(itemArray)) {
      for(let item of itemArray) {
        this.addItem(item, typeName, itemToAddName, itemToAddId);
      }
    }
  }

  /**
   *
   * @param itemArray
   * @param itemToAddId
   * @param typeName : parent_companies, companies
   * @param itemToAddName : companyKeys, locationKeys
   */
  removeItemsArray(itemArray, itemToAddId, typeName, itemToAddName) {
    if(!isNullOrUndefined(itemArray)) {
      for(let item of itemArray) {
        this.removeItem(item, typeName, itemToAddName, itemToAddId);
      }
    }
  }

  removeItem(id, typeName, itemToAddName, item) {
    // console.log(id, typeName, itemToAddName, item);
    let sub = this.getItem(id, typeName).valueChanges().subscribe((data:any) => {
      data.id = id;
      if(!isNullOrUndefined(data[itemToAddName]) && data[itemToAddName].length > 0) {
        let index = data[itemToAddName].indexOf(item);
        if (index > -1) {
          data[itemToAddName].splice(index, 1);
        }
        this.updateItem(data, typeName).then(() => {
          sub.unsubscribe();
        }).catch((e) => {
          this.error = e;
          console.log(e)
          this.openSnackBar('Error')
        });
      }
      else {
        sub.unsubscribe();
      }
    });
  }

  addNewParentCompany(parentCompany) {
    return this.fs.collection('parent_companies').add(parentCompany);
  }

  getParentCompany(parentCompanyKey) {
    return this.fs.doc('parent_companies/'+parentCompanyKey);
  }

  updateParentCompany(parentCompany) {
    return this.fs.doc('parent_companies/'+parentCompany.id).update(parentCompany);
  }


  addSoloEmail(email) {
    return this.fs.collection('send_solo_email').add(email);
  }

  addTestEmail(email) {
    return this.fs.collection('send_test_email').add(email);
  }

  addNewCompany(company) {
    return this.fs.collection('companies').add(company);
  }

  getCompany(companyKey) {
    return this.fs.doc('companies/'+companyKey);
  }

  updateCompany(company) {
    return this.fs.doc('companies/'+company.id).update(company);
  }

  addNewDeal(deal) {
    return this.fs.collection('deals').add(deal);
  }

  getDeal(dealKey) {
    return this.fs.doc('deals/'+dealKey);
  }

  updateDeal(deal) {
    return this.fs.doc('deals/'+deal.id).update(deal);
  }


  getEmailTrackerCounter() {
    return this.fs.doc('counters/email_tracker_count');
  }
  setEmailTrackerCounter(counter) {
    return this.fs.doc('counters/email_tracker_count').set({seq: counter});
  }
  setEmailCampaignTrigger(emailCampaignKey) {
    return this.fs.collection('send_email_trigger').add({emailCampaignKey: emailCampaignKey});
  }
  getEmailCampaignCounter() {
    return this.fs.doc('counters/email_campaign_tracker');
  }
  setEmailCampaignCounter(counter) {
    return this.fs.doc('counters/email_campaign_tracker').set({seq: counter});
  }

  getRecentEmailsViewsThisWeek() {
    return this.fs.collection('email_tracker_views', ref => ref.where('viewed_on', '>', this.weekStart).orderBy('viewed_on', 'desc').limit(10)).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }

  getEmailTemplates() {
    return this.fs.collection('email_templates', ref => ref.orderBy('dateUpdated', 'desc') ).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }

  getShortUrls() {
    return this.fs.collection('short_urls').snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }

  addEmailTemplate(emailTemplate) {
    return this.fs.collection('email_templates').add(emailTemplate);
  }

  getEmailTemplate(emailTemplateKey) {
    return this.fs.doc('email_templates/'+emailTemplateKey);
  }

  updateEmailTemplate(emailTemplate) {
    return this.fs.doc('email_templates/'+emailTemplate.id).update(emailTemplate);
  }




  getEmailLists() {
    return this.fs.collection('email_lists', ref => ref.orderBy('dateUpdated', 'desc') ).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }

  addEmailList(emailList) {
    return this.fs.collection('email_lists').add(emailList);
  }

  getEmailList(emailListKey) {
    return this.fs.doc('email_lists/'+emailListKey);
  }

  updateEmailList(emailList) {
    return this.fs.doc('email_lists/'+emailList.id).update(emailList);
  }


  getEmailCampaigns() {
    return this.fs.collection('email_campaigns', ref => ref.orderBy('dateCreated', 'desc') ).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          var emailTrackerKeys = this.fs.collection(`email_campaigns/${id}/emailTrackerKeys`).valueChanges();
          return { id, emailTrackerKeys, ...data };
        });
      });
  }

  addEmailCampaign(emailCampaign, counter) {
    return this.fs.doc('email_campaigns/' + counter).set(emailCampaign);
  }

  getEmailCampaign(emailCampaignKey) {
    return this.fs.doc('email_campaigns/'+emailCampaignKey).snapshotChanges().map(a => {
      const data = a.payload.data();
      const id = a.payload.id;
      var emailTrackerKeys = this.fs.collection(`email_campaigns/${id}/emailTrackerKeys`).valueChanges();
      var shortUrlClicks = this.fs.collection(`email_campaigns/${id}/shortUrlClicks`).valueChanges();
      var emailTrackerViewKeys = this.fs.collection(`email_campaigns/${id}/emailTrackerViewKeys`).valueChanges();
      var views = this.fs.collection(`email_campaigns/${id}/emailTrackerViewKeys`).valueChanges();
      var shortUrls = this.fs.collection(`email_campaigns/${id}/shortUrls`).valueChanges();
      return {id, shortUrlClicks, emailTrackerViewKeys, emailTrackerKeys, views, shortUrls, ...data};
    });
  }

  updateEmailCampaign(emailCampaign) {
    return this.fs.doc('email_campaigns/'+emailCampaign.id).update(emailCampaign);
  }




  addNewLocation(location) {
    return this.fs.collection('locations').add(location);
  }

  getLocation(locationKey) {
    return this.fs.doc('locations/'+locationKey);
  }

  updateLocation(location) {
    return this.fs.doc('locations/'+location.id).update(location);
  }



  addNewPerson(person) {
    return this.fs.collection('people').add(person);
  }

  getPerson(personKey) {
    return this.fs.doc('people/'+personKey);
  }

  getPersonWithActivity(personKey) {
    return this.fs.doc('people/'+personKey).snapshotChanges()
      .map(a => {
          const data = a.payload.data();
          const id = a.payload.id;
          var activityKeys = this.fs.collection(`people/${personKey}/activityKeys`).valueChanges();
          return { id, activityKeys, ...data };
      });
  }

  updatePerson(person) {
    return this.fs.doc('people/'+person.id).update(person);
  }


  getActivity(activityKey) {
    return this.fs.doc('activity/'+activityKey);
  }

  getRecentActivity() {
    return this.fs.collection('activity', ref => ref.orderBy('date', 'desc').limit(10)).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }

  getUserData() {
    return this.fs.doc('users/'+this.auth.auth.currentUser.uid);
  }

  getUser(uid) {
    return this.fs.doc('users/'+uid);
  }

  saveUserData(data:any) {
    return this.fs.doc('users/'+this.auth.auth.currentUser.uid).set(data);
  }

  getSoloEmail(emailId) {
    return this.fs.doc('send_solo_email/'+emailId).snapshotChanges().map(a => {
        const data = a.payload.data();
        const id = a.payload.id;
        var user = this.getUser(data.sentBy).valueChanges();
        return { id, user, ...data };
    });
  }

  getListItem(key, type) {
    if(type == 'people') {
      return this.getPerson(key).valueChanges();
    }
    else if(type == 'locations') {
      return this.getLocation(key).valueChanges();
    }
    else if(type == 'companies') {
      return this.getCompany(key).valueChanges();
    }
    else if(type == 'parent_companies') {
      return this.getParentCompany(key).valueChanges();
    }
  };

  getTodos(type, id) {
     return this.fs.collection('todos', ref => ref.where('associateToType', '==', type).where('associateToKey', '==', id).orderBy('dueDate', 'desc')).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }

  getAllTodos() {
    return this.fs.collection('todos', ref => ref.orderBy('dueDate', 'asc')).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }

  getAllMyTodos() {
    return this.fs.collection('todos', ref => ref.where('assignToUserKey', '==', this.auth.auth.currentUser.uid).orderBy('dueDate', 'asc')).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }

  getAllMyNonCompleteTodos() {
    return this.fs.collection('todos', ref => ref.where('assignToUserKey', '==', this.auth.auth.currentUser.uid).where('complete', '==', false).orderBy('dueDate', 'asc')).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }

  getAllNonCompleteTodos() {
    return this.fs.collection('todos', ref => ref.where('complete', '==', false).orderBy('dueDate', 'asc')).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }

  getEmailTrackers(emailCampaignKey) {
    return this.fs.collection('email_trackers', ref => ref.where('emailCampaignKey', '==', String(emailCampaignKey))).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          var shortUrlClicks = this.getShortUrlClicks(id);
          var shortUrlClicksCount = this.getShortUrlClicks(id);
          var shortUrlKeys = this.fs.collection(`email_trackers/${id}/shortUrlKeys`).valueChanges();
          var views = this.fs.collection(`email_trackers/${id}/views`, ref => ref.orderBy('viewed_on', 'desc')).valueChanges();
          var viewsCount = this.fs.collection(`email_trackers/${id}/views`).valueChanges();
          var contact = this.getItem(data.receiverKey, data.receiverType).valueChanges();
          return { id, shortUrlClicks, shortUrlClicksCount, viewsCount, shortUrlKeys, views, contact, ...data };
        });
      });
  }

  getAllEmailTrackers() {
    return this.fs.collection('email_trackers').snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }

  getAllEmailTrackerViews() {
    return this.fs.collection('email_tracker_views').snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }

  getAllEmailTrackerShortUrlClicks() {
    return this.fs.collection('short_url_clicks').snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }

  addLead(lead) {
    let tmp = JSON.parse(JSON.stringify(lead));
    tmp.dateAdded = new Date();
    return this.fs.collection('leads').add(tmp);
  }

  updateLead(lead) {
    console.log('update lead')
    console.log(lead)
    return this.fs.doc('leads/'+lead.id).update(lead);
  }

  addLeadStatusToContact(lead: Lead) {
    let sub = this.getItem(lead.receiverKey, lead.receiverType).snapshotChanges()
      .map(a => {
          const data = a.payload.data();
          const id = a.payload.id;
          return { id, ...data };
      }).subscribe((item: any) => {
      sub.unsubscribe();
      item.leadStatus = lead.leadType;
      this.updateItem(item, lead.receiverType);
    });
  }

  getLeadsForLeadType(type) {
    return this.fs.collection('leads', ref => ref.where('leadType', '==', type)).valueChanges();
  }

  getLeadForContact(type, key) {
    return this.fs.collection('leads', ref => ref.where('receiverType', '==', type).where('receiverKey', '==', key)).snapshotChanges()

  }

  getEmailTrackersForATypeOnlyCount(receiverKey, receiverType) {
    return this.fs.collection('email_trackers', ref => ref.where('receiverType', '==', receiverType).where('receiverKey', '==', receiverKey)).snapshotChanges();
  }

  getShortUrlClicks(id) {
    return this.fs.collection(`email_trackers/${id}/shortUrlClicks`).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }

  getEmailTrackerViews(id) {
    return this.fs.collection(`email_trackers/${id}/views`).snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }

  addTodo(todo) {
    return this.fs.collection('todos').add(todo);
  }

  updateTodo(todo) {
    return this.fs.doc('todos/'+todo.id).update(todo);
  }

  openSnackBar(message: string, action: string = 'Close') {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
