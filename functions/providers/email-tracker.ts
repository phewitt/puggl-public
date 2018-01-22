import {addEmailTrackerToCampaign, getEmailCounter, saveEmailTracker, savePerson, updateEmailCounter} from "./firebase";
import {config} from "../config";
import {encode} from "./encode";
import {isNullOrUndefined} from "util";

export const generateEmailTrackerNoEmailCampaign = (data, person, counter) => {
  let date = new Date();

    var et = {
      emailCampaignKey: data.emailCampaignKey,
      receiverType: data.receiverType,
      receiverKey: data.receiverKey,
      receiverName: '',
      id: counter,
      to: data.to,
      fromName: data.fromName,
      isActive: true,
      error: false,
      isNotifications: true,
      date: date,
      link: config.emailTracker + '?t=' + encode(counter),
      sentBy: data.sentBy,
      soloEmailId: data.soloEmailId
    };

    if(et.receiverType == 'people') {
      et.receiverName = person.firstName + ' ' + person.lastName;
    }
    else {
      et.receiverName = person.name;
    }

    return saveEmailTracker(et, counter).then((ret) => {

      if(isNullOrUndefined(person.emailTrackerKeys)) {
        person.emailTrackerKeys = [];
      }
      person.emailTrackerKeys.push(counter);

      savePerson(data.receiverKey, data.receiverType, person);

      return {
        link: et.link,
        id: counter
      };
    }).catch((error) => {
      console.error("Error adding document: ", error);
    });
};

export const generateEmailTracker = (data, person, emailCampaign, counter) => {
  let date = new Date();
    var et = {
      emailCampaignKey: data.emailCampaignKey,
      receiverType: data.receiverType,
      receiverKey: data.receiverKey,
      receiverName: '',
      id: counter,
      to: data.to,
      fromName: data.fromName,
      isActive: true,
      error: false,
      isNotifications: true,
      date: date,
      link: config.emailTracker + '?t=' + encode(counter),
      sentBy: data.sentBy
    };

    if(et.receiverType == 'people') {
      et.receiverName = person.firstName + ' ' + person.lastName;
    }
    else {
      et.receiverName = person.name;
    }

    return saveEmailTracker(et, counter).then((ret) => {

      if(isNullOrUndefined(emailCampaign.emailTrackerKeys)) {
        emailCampaign.emailTrackerKeys = [];
      }
      emailCampaign.emailTrackerKeys.push(counter);

      addEmailTrackerToCampaign(emailCampaign.id, counter);

      if(isNullOrUndefined(person.emailTrackerKeys)) {
        person.emailTrackerKeys = [];
      }
      person.emailTrackerKeys.push(counter);

      savePerson(data.receiverKey, data.receiverType, person);

      return {
        link: et.link,
        id: counter
      };
    }).catch((error) => {
      console.error("Error adding document: ", error);
    });
};
