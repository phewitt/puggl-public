"use strict";
exports.__esModule = true;
var firebase_admin_1 = require("./firebase-admin");
var db = firebase_admin_1.fbAdmin.firestore();
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
exports.getCompanies = function () {
    return companiesRef.get();
};
exports.getSources = function () {
    return sourcesDataRef.orderBy('name', 'asc').get();
};
exports.getLeadForContact = function (type, key) {
    return leadRef.where('receiverType', '==', type).where('receiverKey', '==', key).limit(1).get();
};
exports.addLead = function (lead) {
    return leadRef.add(lead);
};
exports.updateLead = function (lead) {
    return leadRef.doc(lead.id).update(lead);
};
exports.getActivityTypes = function () {
    return activityDataRef.orderBy('name', 'asc').get();
};
exports.getDealStages = function () {
    return dealStagesDataRef.orderBy('name', 'asc').get();
};
exports.getRecentActivity = function () {
    return activityRef.orderBy('date', 'desc').limit(10).get();
};
exports.getRecentEmailsViewsThisWeek = function () {
    return emailViewRef.where('viewed_on', '>', weekStart).orderBy('viewed_on', 'desc').limit(10).get();
};
exports.getPeopleAddedThisWeek = function () {
    return peopleRef.where('dateAdded', '>', weekStart).get();
};
exports.getCompaniesAddedThisWeek = function () {
    return companiesRef.where('dateAdded', '>', weekStart).get();
};
exports.getLocationsAddedThisWeek = function () {
    return locationsRef.where('dateAdded', '>', weekStart).get();
};
exports.getParentCompaniesAddedThisWeek = function () {
    return parentCompanyRef.where('dateAdded', '>', weekStart).get();
};
exports.getEmailsSentThisWeek = function () {
    return emailTrackerRef.where('date', '>', weekStart).get();
};
exports.getEmailsViewsThisWeek = function () {
    return emailViewRef.where('viewed_on', '>', weekStart).get();
};
exports.getTodosCreatedThisWeek = function () {
    return todoRef.where('dateAdded', '>', weekStart).get();
};
exports.getSoftwareTypes = function () {
    return softwareDataRef.orderBy('name', 'asc').get();
};
exports.getDefaultActivity = function (key) {
    return activityDataRef.doc(key).get();
};
exports.getSoloEmail = function (key) {
    return soloEmailRef.doc(key).get();
};
exports.getLocations = function () {
    return locationsRef.get();
};
exports.getParentCompanies = function () {
    return parentCompanyRef.get();
};
exports.getPeople = function () {
    return peopleRef.get();
};
exports.getEmailLists = function () {
    return emailListsRef.get();
};
exports.getEmailCampaigns = function () {
    return emailCampaignRef.orderBy('dateCreated', 'desc').get();
};
exports.getEmailTemplates = function () {
    return emailTemplatesRef.get();
};
exports.getUsers = function () {
    return usersRef.get();
};
exports.getShortUrls = function () {
    return urlRef.get();
};
exports.updateCounter = function () {
    counterRef.doc('short_url_count').get()
        .then(function (doc) {
        if (!doc.exists) {
            console.log('No such document!');
        }
        else {
            console.log('Document data:', doc.data());
            var data = doc.data();
            counterRef.doc('short_url_count').update({ seq: data.seq + 1 });
        }
    })["catch"](function (err) {
        console.log('Error getting document', err);
    });
};
exports.updateEmailCounter = function () {
    counterRef.doc('email_tracker_count').get()
        .then(function (doc) {
        if (!doc.exists) {
            console.log('No such document!');
        }
        else {
            console.log('Document data:', doc.data());
            var data = doc.data();
            counterRef.doc('email_tracker_count').update({ seq: data.seq + 1 });
        }
    })["catch"](function (err) {
        console.log('Error getting document', err);
    });
};
exports.getCounter = function () {
    return counterRef.doc('short_url_count').get();
};
exports.getEmailCounter = function () {
    return counterRef.doc('email_tracker_count').get();
};
exports.getEmailCampaign = function (key) {
    return emailCampaignRef.doc(String(key)).get();
};
exports.getMessageToken = function (key) {
    return tokenRef.doc(key).get();
};
exports.getEmailTemplate = function (key) {
    return emailTemplatesRef.doc(key).get();
};
exports.getPerson = function (key, type) {
    if (type == 'people') {
        return peopleRef.doc(key).get();
    }
    else if (type == 'locations') {
        return locationsRef.doc(key).get();
    }
    else if (type == 'companies') {
        return companiesRef.doc(key).get();
    }
    else if (type == 'parent_companies') {
        return parentCompanyRef.doc(key).get();
    }
};
exports.savePerson = function (key, type, person) {
    if (type == 'people') {
        return peopleRef.doc(key).set(person);
    }
    else if (type == 'locations') {
        return locationsRef.doc(key).set(person);
    }
    else if (type == 'companies') {
        return companiesRef.doc(key).set(person);
    }
    else if (type == 'parent_companies') {
        return parentCompanyRef.doc(key).set(person);
    }
};
exports.getUser = function (key) {
    return usersRef.doc(key).get();
};
exports.getEmailsForCampaign = function (key) {
    return sendEmailRef.where('emailCampaignKey', '==', key).get();
};
exports.getEmailTrackersForUser = function (key) {
    return emailTrackerRef.where('sentBy', '==', key).orderBy('date', 'desc').get();
};
exports.saveUrl = function (url, counter) {
    return urlRef.doc(String(counter)).set(url);
};
exports.saveEmailTracker = function (email, counter) {
    return emailTrackerRef.doc(String(counter)).set(email);
};
exports.addviewToEmailTracker = function (id, data) {
    return emailTrackerRef.doc(String(id)).collection('views').add(data);
};
exports.getEmailTracker = function (id) {
    return emailTrackerRef.doc(String(id)).get();
};
exports.getEmailTrackers = function () {
    return emailTrackerRef.get();
};
exports.getEmailTrackerClicks = function (id) {
    return db.collection("email_trackers/" + id + "/shortUrlClicks").get();
};
exports.getEmailTrackerViews = function (id) {
    return db.collection("email_trackers/" + id + "/views").get();
};
exports.getTodosForAType = function (receiverKey, receiverType) {
    return todoRef.where('associateToType', '==', receiverType).where('associateToKey', '==', receiverKey).orderBy('dueDate', 'asc').get();
};
exports.getDealsForAType = function (receiverKey, receiverType) {
    return dealsRef.where('postedToType', '==', receiverType).where('postedToKey', '==', receiverKey).orderBy('expectedClose', 'desc').get();
};
exports.getRecentDeals = function () {
    return dealsRef.orderBy('dateAdded', 'desc').limit(10).get();
};
exports.getAllDeals = function () {
    return dealsRef.orderBy('dateAdded', 'desc').get();
};
exports.getPeopleForAccountExecutiveUser = function (userKey) {
    return peopleRef.where('accountExecutiveKey', '==', userKey).orderBy('dateUpdated', 'asc').get();
};
exports.getLocationsForAccountExecutiveUser = function (userKey) {
    return locationsRef.where('accountExecutiveKey', '==', userKey).orderBy('dateUpdated', 'asc').get();
};
exports.getCompaniesForAccountExecutiveUser = function (userKey) {
    return companiesRef.where('accountExecutiveKey', '==', userKey).orderBy('dateUpdated', 'asc').get();
};
exports.getAllCustomers = function () {
    return companiesRef.where('isCustomer', '==', true).orderBy('dateUpdated', 'desc').get();
};
exports.getParentCompaniesForAccountExecutiveUser = function (userKey) {
    return parentCompanyRef.where('accountExecutiveKey', '==', userKey).orderBy('dateUpdated', 'asc').get();
};
exports.getEmailTrackersForAType = function (receiverKey, receiverType) {
    return emailTrackerRef.where('receiverType', '==', receiverType).where('receiverKey', '==', receiverKey).orderBy('date', 'desc').get();
};
exports.getRecentViewsForTracker = function (id) {
    return emailViewRef.where('email_tracker_id', '==', id).orderBy('viewed_on', "desc").limit(1).get();
};
exports.updateRecentView = function (id, et) {
    return emailViewRef.doc(id).update(et);
};
exports.addClickToCampain = function (id, data) {
    return emailCampaignRef.doc(String(id)).collection('shortUrlClicks').add({
        url: data
    });
};
exports.getTypeActivity = function (key, type) {
    if (type == 'people') {
        return db.collection("people/" + key + "/activityKeys").get();
    }
    else if (type == 'locations') {
        return db.collection("locations/" + key + "/activityKeys").get();
    }
    else if (type == 'companies') {
        return db.collection("companies/" + key + "/activityKeys").get();
    }
    else if (type == 'parent_companies') {
        return db.collection("parent_companies/" + key + "/activityKeys").get();
    }
};
exports.removeAnItem = function (key, type) {
    if (type == 'people') {
        return db.collection("people").doc(key)["delete"]();
    }
    else if (type == 'locations') {
        return db.collection("locations").doc(key)["delete"]();
    }
    else if (type == 'companies') {
        return db.collection("companies").doc(key)["delete"]();
    }
    else if (type == 'parent_companies') {
        return db.collection("parent_companies").doc(key)["delete"]();
    }
};
exports.addClickToEmailTracker = function (id, data) {
    return emailTrackerRef.doc(String(id)).collection('shortUrlClicks').add({
        key: data
    });
};
exports.addEmailTrackerToCampaign = function (id, data) {
    return emailCampaignRef.doc(String(id)).collection('emailTrackerKeys').add({
        key: data
    });
};
exports.addUrlToCampaign = function (id, data) {
    return emailCampaignRef.doc(String(id)).collection('shortUrls').add({
        url: data
    });
};
exports.addEmailTrackerViewToCampaign = function (id, data) {
    return emailCampaignRef.doc(String(id)).collection('emailTrackerViewKeys').add(data);
};
exports.addUrlToEmailTracker = function (id, data) {
    return emailTrackerRef.doc(String(id)).collection('shortUrlKeys').add({
        key: data
    });
};
exports.addEmailTrackerView = function (view) {
    return emailViewRef.add(view);
};
exports.findUrl = function (url) {
    return urlRef.where('long_url', '==', url).get();
};
exports.addClick = function (click) {
    return clickRef.add(click);
};
exports.findUrlById = function (id) {
    return urlRef.doc(String(id)).get();
};
