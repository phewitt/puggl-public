import {fbAdmin} from "./firebase-admin";
import NumberFormat = Intl.NumberFormat;
import {isNullOrUndefined} from "util";
import {getEmailTrackersForAType} from "./firebase";

var db = fbAdmin.firestore();

export const buildEmailTrackersForAPerson = async (person, emailTrackers, res) => {
  if(!isNullOrUndefined(person.peopleKeys)) {
    for(let key of person.peopleKeys) {
      await getEmailTrackersHelper(key, 'people', emailTrackers);
    }
  }
  if(!isNullOrUndefined(person.locationKeys)) {
    for(let key of person.locationKeys) {
      await getEmailTrackersHelper(key, 'locations', emailTrackers);
    }
  }
  if(!isNullOrUndefined(person.companyKeys)) {
    for(let key of person.companyKeys) {
      await getEmailTrackersHelper(key, 'companies', emailTrackers);
    }
  }
  if(!isNullOrUndefined(person.parentCompanyKeys)) {
    for(let key of person.parentCompanyKeys) {
      await getEmailTrackersHelper(key, 'parent_companies', emailTrackers);
    }
  }

  buildEmailTrackersFromArray(emailTrackers, res);
};

export const getEmailTrackersHelper = async (receiverKey, receiverType, emailTrackers) => {
  return getEmailTrackersForAType(receiverKey, receiverType).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      emailTrackers.push(tmp);
    });
  });
};

export const buildEmailTrackersFromArray = async (emailTrackers, res) => {
  let data = [];

  if (emailTrackers.length) {
    for(let doc of emailTrackers) {
      let tmp = doc;
      tmp.shortUrlKeys = [];
      tmp.views = [];
      tmp.shortUrlClicks = [];
      await getShortUrlKeys(tmp);
      await getShortUrlViews(tmp);
      await getShortUrlClicks(tmp);
      data.push(tmp);
    };
    data.sort((a,b) => {
      let aDate = new Date(b.date);
      let bDate = new Date(a.date);
      return aDate.getTime() - bDate.getTime();
    });
    res.send(data);
  }
  else {
    res.send([]);
  }
};


export const buildEmailTrackers = async (snapshot, res) => {
  let data = [];

  if (snapshot.docs.length) {
    for(let doc of snapshot.docs) {
      let tmp = doc.data();
      tmp.id = doc.id;
      tmp.shortUrlKeys = [];
      tmp.views = [];
      tmp.shortUrlClicks = [];
      await getShortUrlKeys(tmp);
      await getShortUrlViews(tmp);
      await getShortUrlClicks(tmp);
      data.push(tmp);
    };
    res.send(data);
  }
  else {
    res.send([]);
  }
};

export const getShortUrlKeys = async (keys) => {
  return await db.collection(`email_trackers/${keys.id}/shortUrlKeys`).get().then((snapshot) => {
    if (snapshot.docs.length) {
      snapshot.forEach((doc) => {
        let tmp = doc.data();
        tmp.id = doc.id;
        keys.shortUrlKeys.push(tmp);
      })
    }
  });
};

export const getShortUrlViews = async (keys) => {
  return await db.collection(`email_trackers/${keys.id}/views`).get().then((snapshot) => {
    if (snapshot.docs.length) {
      snapshot.forEach((doc) => {
        let tmp = doc.data();
        tmp.id = doc.id;
        keys.views.push(tmp);
      })
    }
  });
};

export const getShortUrlClicks = async (keys) => {
  return await db.collection(`email_trackers/${keys.id}/shortUrlClicks`).get().then((snapshot) => {
    if (snapshot.docs.length) {
      for(let doc of snapshot.docs) {
        let tmp = doc.data();
        tmp.id = doc.id;
        getClick(tmp);
        keys.shortUrlClicks.push(tmp);
      }
    }
  });
};

export const getClick = async (click) => {
  return await db.doc(`short_url_clicks/${click.key}`).get().then((snapshot) => {
      click.click = snapshot.data();
  });
};

export const buildActivityItems = async (snapshot, res) => {
  let data = [];

  if (snapshot.docs.length) {
    for(let doc of snapshot.docs) {
      let tmp = doc.data();
      tmp.id = doc.id;
      await getActivityItem(tmp);
      data.push(tmp);
    };
    data.sort((a,b) => {
      let aDate = new Date(b.date);
      let bDate = new Date(a.date);
      return aDate.getTime() - bDate.getTime();
    });
    res.send(data);
  }
  else {
    res.send([]);
  }
};

export const getActivityItem = async (item) => {
  return await db.doc(`activity/${item.activity_id}`).get().then((snapshot) => {
    item.activity = snapshot.data();
  });
};
