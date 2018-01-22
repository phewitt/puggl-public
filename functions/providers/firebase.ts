import {fbAdmin} from "./firebase-admin";
import NumberFormat = Intl.NumberFormat;

var db = fbAdmin.firestore();
var counterRef = db.collection('counters');

var emailTrackerRef = db.collection('email_trackers');
var emailViewRef = db.collection('email_tracker_views');
var urlRef = db.collection('short_urls');
var clickRef = db.collection('short_url_clicks');
var tokenRef = db.collection('fcm_tokens');
var sendEmailRef = db.collection('send_email');
var soloEmailRef = db.collection('send_solo_email');

var emailCampaignRef = db.collection('email_campaigns');
var emailTemplatesRef = db.collection('email_templates');
var emailListsRef = db.collection('email_lists');
var peopleRef = db.collection('people');
var companiesRef = db.collection('companies');
var locationsRef = db.collection('locations');
var parentCompanyRef = db.collection('parent_companies');
var usersRef = db.collection('users');
var leadRef = db.collection('leads');
var todoRef = db.collection('todos');
var dealsRef = db.collection('deals');
var activityRef = db.collection('activity');
var softwareDataRef = db.collection('default/data/softwares');
var activityDataRef = db.collection('default/data/activities');
var dealStagesDataRef = db.collection('default/data/deal_stages');
var sourcesDataRef = db.collection('default/data/sources');
var weekStart = new Date();
weekStart.setDate(weekStart.getDate() - 7);

export const getCompanies = () => {
  return companiesRef.get();
};

export const getSources = () => {
  return sourcesDataRef.orderBy('name', 'asc').get();
};

export const getLeadForContact = (type, key) => {
  return leadRef.where('receiverType', '==', type).where('receiverKey', '==', key).limit(1).get();
};

export const addLead = (lead) => {
  return leadRef.add(lead);
};

export const updateLead = (lead) => {
  return leadRef.doc(lead.id).update(lead);
};

export const getActivityTypes = () => {
  return activityDataRef.orderBy('name', 'asc').get();
};

export const getDealStages = () => {
  return dealStagesDataRef.orderBy('name', 'asc').get();
};

export const getRecentActivity = () => {
  return activityRef.orderBy('date', 'desc').limit(10).get();
};

export const getRecentEmailsViewsThisWeek = () => {
  return emailViewRef.where('viewed_on', '>', weekStart).orderBy('viewed_on', 'desc').limit(10).get();
};

export const getPeopleAddedThisWeek = () => {
  return peopleRef.where('dateAdded', '>', weekStart).get();
};
export const getCompaniesAddedThisWeek = () => {
  return companiesRef.where('dateAdded', '>', weekStart).get();
};
export const getLocationsAddedThisWeek = () => {
  return locationsRef.where('dateAdded', '>', weekStart).get();
};
export const getParentCompaniesAddedThisWeek = () => {
  return parentCompanyRef.where('dateAdded', '>', weekStart).get();
};

export const getEmailsSentThisWeek = () => {
  return emailTrackerRef.where('date', '>', weekStart).get();
};
export const getEmailsViewsThisWeek = () => {
  return emailViewRef.where('viewed_on', '>', weekStart).get();
};
export const getTodosCreatedThisWeek = () => {
  return todoRef.where('dateAdded', '>', weekStart).get();
};

export const getSoftwareTypes = () => {
  return softwareDataRef.orderBy('name', 'asc').get();
};

export const getDefaultActivity = (key) => {
  return activityDataRef.doc(key).get();
};

export const getSoloEmail = (key) => {
  return soloEmailRef.doc(key).get();
};

export const getLocations = () => {
  return locationsRef.get();
};

export const getParentCompanies = () => {
  return parentCompanyRef.get();
};

export const getPeople = () => {
  return peopleRef.get();
};

export const getEmailLists = () => {
  return emailListsRef.get();
};

export const getEmailCampaigns = () => {
  return emailCampaignRef.orderBy('dateCreated', 'desc').get();
};

export const getEmailTemplates = () => {
  return emailTemplatesRef.get();
};

export const getUsers = () => {
  return usersRef.get();
};

export const getShortUrls = () => {
  return urlRef.get();
};

export const updateCounter = () => {
    counterRef.doc('short_url_count').get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                console.log('Document data:', doc.data());

                let data = doc.data();
                counterRef.doc('short_url_count').update({seq: data.seq + 1});
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
};

export const updateEmailCounter = () => {
  counterRef.doc('email_tracker_count').get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                console.log('Document data:', doc.data());

                let data = doc.data();
              counterRef.doc('email_tracker_count').update({seq: data.seq + 1});
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
};

export const getCounter = () => {
    return counterRef.doc('short_url_count').get();
};

export const getEmailCounter = () => {
    return counterRef.doc('email_tracker_count').get();
};

export const getEmailCampaign = (key) => {
  return emailCampaignRef.doc(String(key)).get();
};

export const getMessageToken = (key) => {
  return tokenRef.doc(key).get();
};

export const getEmailTemplate = (key) => {
  return emailTemplatesRef.doc(key).get();
};

export const getPerson = (key, type) => {
  if(type == 'people') {
    return peopleRef.doc(key).get();
  }
  else if(type == 'locations') {
    return locationsRef.doc(key).get();
  }
  else if(type == 'companies') {
    return companiesRef.doc(key).get();
  }
  else if(type == 'parent_companies') {
    return parentCompanyRef.doc(key).get();
  }
};

export const savePerson = (key, type, person) => {
  if(type == 'people') {
    return peopleRef.doc(key).set(person);
  }
  else if(type == 'locations') {
    return locationsRef.doc(key).set(person);
  }
  else if(type == 'companies') {
    return companiesRef.doc(key).set(person);
  }
  else if(type == 'parent_companies') {
    return parentCompanyRef.doc(key).set(person);
  }
};

export const getUser = (key) => {
  return usersRef.doc(key).get();
};

export const getEmailsForCampaign = (key) => {
    return sendEmailRef.where('emailCampaignKey' , '==', key).get();
};

export const getEmailTrackersForUser = (key) => {
  return emailTrackerRef.where('sentBy' , '==', key).orderBy('date', 'desc').get();
};

export const saveUrl = (url, counter) => {
    return urlRef.doc(String(counter)).set(url)
};

export const saveEmailTracker = (email, counter) => {
    return emailTrackerRef.doc(String(counter)).set(email);
};

export const addviewToEmailTracker = (id, data) => {
  return emailTrackerRef.doc(String(id)).collection('views').add(data);
};


export const getEmailTracker = (id) => {
    return emailTrackerRef.doc(String(id)).get();
};

export const getEmailTrackers = () => {
  return emailTrackerRef.get();
};

export const getEmailTrackerClicks = (id) => {
  return db.collection(`email_trackers/${id}/shortUrlClicks`).get();
};

export const getEmailTrackerViews = (id) => {
  return db.collection(`email_trackers/${id}/views`).get();
};

export const getTodosForAType = (receiverKey, receiverType) => {
  return todoRef.where('associateToType', '==', receiverType).where('associateToKey', '==', receiverKey).orderBy('dueDate', 'asc').get();
};

export const getDealsForAType = (receiverKey, receiverType) => {
  return dealsRef.where('postedToType', '==', receiverType).where('postedToKey', '==', receiverKey).orderBy('expectedClose', 'desc').get();
};

export const getRecentDeals = () => {
  return dealsRef.orderBy('dateAdded', 'desc').limit(10).get();
};

export const getAllDeals = () => {
  return dealsRef.orderBy('dateAdded', 'desc').get();
};

export const getPeopleForAccountExecutiveUser = (userKey) => {
  return peopleRef.where('accountExecutiveKey', '==', userKey).orderBy('dateUpdated', 'asc').get();
};
export const getLocationsForAccountExecutiveUser = (userKey) => {
  return locationsRef.where('accountExecutiveKey', '==', userKey).orderBy('dateUpdated', 'asc').get();
};
export const getCompaniesForAccountExecutiveUser = (userKey) => {
  return companiesRef.where('accountExecutiveKey', '==', userKey).orderBy('dateUpdated', 'asc').get();
};

export const getAllCustomers = () => {
  return companiesRef.where('isCustomer', '==', true).orderBy('dateUpdated', 'desc').get();
};

export const getParentCompaniesForAccountExecutiveUser = (userKey) => {
  return parentCompanyRef.where('accountExecutiveKey', '==', userKey).orderBy('dateUpdated', 'asc').get();
};

export const getEmailTrackersForAType = (receiverKey, receiverType) => {
  return emailTrackerRef.where('receiverType', '==', receiverType).where('receiverKey', '==', receiverKey).orderBy('date', 'desc').get();
};

export const getRecentViewsForTracker = (id) => {
  return emailViewRef.where('email_tracker_id', '==', id).orderBy('viewed_on', "desc").limit(1).get();
};

export const updateRecentView = (id, et) => {
  return emailViewRef.doc(id).update(et);
};

export const addClickToCampain = (id, data) => {
  return emailCampaignRef.doc(String(id)).collection('shortUrlClicks').add({
    url: data
  });
};

export const getTypeActivity = (key, type) => {
  if(type == 'people') {
    return db.collection(`people/${key}/activityKeys`).get();
  }
  else if(type == 'locations') {
    return db.collection(`locations/${key}/activityKeys`).get();
  }
  else if(type == 'companies') {
    return db.collection(`companies/${key}/activityKeys`).get();
  }
  else if(type == 'parent_companies') {
    return db.collection(`parent_companies/${key}/activityKeys`).get();
  }
};

export const removeAnItem = (key, type) => {
  if(type == 'people') {
    return db.collection(`people`).doc(key).delete();
  }
  else if(type == 'locations') {
    return db.collection(`locations`).doc(key).delete();
  }
  else if(type == 'companies') {
    return db.collection(`companies`).doc(key).delete();
  }
  else if(type == 'parent_companies') {
    return db.collection(`parent_companies`).doc(key).delete();
  }
};

export const addClickToEmailTracker = (id, data) => {
  return emailTrackerRef.doc(String(id)).collection('shortUrlClicks').add({
    key: data
  });
};

export const addEmailTrackerToCampaign = (id, data) => {
  return emailCampaignRef.doc(String(id)).collection('emailTrackerKeys').add({
    key: data
  });
};

export const addUrlToCampaign = (id, data) => {
  return emailCampaignRef.doc(String(id)).collection('shortUrls').add({
    url: data
  });
};

export const addEmailTrackerViewToCampaign = (id, data) => {
  return emailCampaignRef.doc(String(id)).collection('emailTrackerViewKeys').add(data);
};

export const addUrlToEmailTracker = (id, data) => {
  return emailTrackerRef.doc(String(id)).collection('shortUrlKeys').add({
    key: data
  });
};

export const addEmailTrackerView = (view) => {
    return emailViewRef.add(view);
};

export const findUrl = (url) => {
    return urlRef.where('long_url', '==', url).get();
};

export const addClick = (click) => {
    return clickRef.add(click);
};

export const findUrlById = (id) => {
    return urlRef.doc(String(id)).get();
};
