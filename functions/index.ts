import {getShortUrl, getShortUrlFromEmail, sendImage} from "./function-defs";
import {
  generateEmailAsyncFunction,
  generateSoloEmail, resendEmail
} from "./providers/email-middleware";
import {
  addLead,
  getActivityTypes, getAllCustomers, getAllDeals,
  getCompanies, getCompaniesAddedThisWeek, getCompaniesForAccountExecutiveUser, getDealsForAType, getDealStages,
  getDefaultActivity,
  getEmailCampaign,
  getEmailCampaigns,
  getEmailLists, getEmailsForCampaign,
  getEmailsSentThisWeek, getEmailsViewsThisWeek,
  getEmailTemplates, getEmailTracker, getEmailTrackerClicks, getEmailTrackers,
  getEmailTrackersForAType, getEmailTrackersForUser, getEmailTrackerViews, getLeadForContact,
  getLocations, getLocationsAddedThisWeek, getLocationsForAccountExecutiveUser, getMessageToken,
  getParentCompanies, getParentCompaniesAddedThisWeek, getParentCompaniesForAccountExecutiveUser, getPeople,
  getPeopleAddedThisWeek,
  getPeopleForAccountExecutiveUser,
  getPerson, getRecentActivity, getRecentDeals, getRecentEmailsViewsThisWeek, getShortUrls, getSoftwareTypes,
  getSources,
  getTodosCreatedThisWeek,
  getTodosForAType,
  getTypeActivity,
  getUser, getUsers, removeAnItem, savePerson, updateLead
} from "./providers/firebase";
import {fbAdmin} from "./providers/firebase-admin";
import {sendTestEmail} from "./providers/send-emails";
import {
  buildActivityItems, buildEmailTrackers, buildEmailTrackersForAPerson,
} from "./providers/app-middleware";
import {isNullOrUndefined} from "util";
import {createMailTransport} from "./config";
import {Lead} from "./models/lead";
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});

exports.redirectToShortUrl = functions.https.onRequest((req, res) => {
  let origUrl = req.originalUrl;
  var params = origUrl.split('/');
  console.log(params);
  if(params.length < 3 || params.length > 5) {
    res.redirect('https://storagepug.com');
  }
  else {
    switch(params.length) {
      case 3:
        getShortUrl(req, res, {encoded_id: params[2]});
        break;
      case 4:
        getShortUrlFromEmail(req, res, {
          encoded_id: params[2],
          encoded_email_id: params[3],
          encoded_campaign_id: 'solo_email'
        });
        break;
      case 5:
        getShortUrlFromEmail(req, res, {
          encoded_id: params[2],
          encoded_email_id: params[3],
          encoded_campaign_id: params[4]
        });
        break;
    }
  }
});

exports.addLeadFromView = functions.firestore.document('email_tracker_views/{pushId}').onCreate(event => {
  const data = event.data.data();
  const id = event.params.pushId;
  return getPerson(data.receiverKey, data.receiverType).then((person) => {
    let personData = person.data();
    personData.id = person.id;
    return getLeadForContact(data.receiverType, data.receiverKey).then((snapshot) => {
      var lead;
      if (snapshot.docs.length >= 1) {
        lead = snapshot.docs[0].data();
        lead.id = snapshot.docs[0].id;
        lead.views = lead.views + 1;

        if(lead.clicks > 0 || lead.views > 1) {
          lead.leadType = 'warm';
          personData.leadStatus = 'warm';
        }
        else {
          lead.leadType = 'cold';
          personData.leadStatus = 'cold';
        }
        personData.dateUpdated = new Date();
        updateLead(lead);
        savePerson(data.receiverKey, data.receiverType, personData);
      }
      else {
        lead = new Lead();
        lead.receiverType = data.receiverType;
        lead.receiverKey = data.receiverKey;
        lead.views = 1;
        lead.leadType = 'cold';
        personData.leadStatus = 'cold';
        personData.dateUpdated = new Date();

        let tmp = JSON.parse(JSON.stringify(lead));
        tmp.dataAdded = new Date();
        tmp.addedBy = 'auto';

        addLead(tmp);
        savePerson(data.receiverKey, data.receiverType, personData);
      }
    }).catch((err) => {
      console.log('error addLeadFromView 2!!!!: ' + err);
    });

  }).catch((err) => {
    console.log('error addLeadFromView !!!!: ' + err);
  });
});

exports.addLeadFromClick = functions.firestore.document('short_url_clicks/{pushId}').onCreate(event => {
  const data = event.data.data();
  const id = event.params.pushId;
  console.log(id);
  return getPerson(data.receiverKey, data.receiverType).then((person) => {
    let personData = person.data();
    personData.id = person.id;
    return getLeadForContact(data.receiverType, data.receiverKey).then((snapshot) => {
      var lead;
      if (snapshot.docs.length >= 1) {
        lead = snapshot.docs[0].data();
        lead.id = snapshot.docs[0].id;
        lead.clicks = lead.clicks + 1;
        if(lead.leadType != 'warm') {
          lead.leadType = 'warm';
          personData.leadStatus = 'warm';
          personData.dateUpdated = new Date();
          updateLead(lead);
          savePerson(data.receiverKey, data.receiverType, personData);
        }
      }
      else {
        lead = new Lead();
        lead.receiverType = data.receiverType;
        lead.receiverKey = data.receiverKey;
        lead.clicks = 1;
        lead.leadType = 'warm';
        personData.leadStatus = 'warm';
        personData.dateUpdated = new Date();
        let tmp = JSON.parse(JSON.stringify(lead));
        tmp.dateAdded = new Date();
        tmp.addedBy = 'auto';

        addLead(tmp);
        savePerson(data.receiverKey, data.receiverType, personData);
      }
    });
  }).catch((err) => {
    console.log('error!!!!: ' + err);
  });
});

exports.image = functions.https.onRequest((req, res) => {
  /**
   * TODO: Add these to also be saved on email_campaigns
   */
  switch(req.method) {
    case 'GET':
      sendImage(req, res);
      break;
  }
});

exports.sendEmail = functions.firestore.document('send_email_trigger/{pushId}').onCreate(event => {
  let exampleData = {
    emailCampaignKey: '100',
    receiverType: 'people',
    receiverKey: 'oZev2UxFtnpvWbZhJjYT',
  };

  const data = event.data.data();
  console.log('start: ', data)
  return getEmailsForCampaign(data.emailCampaignKey).then((emails) => {

    return getEmailCampaign(data.emailCampaignKey).then(emailCampaignSnap => {
      let emailCampaign = emailCampaignSnap.data();
      emailCampaign.id = emailCampaignSnap.id;
      return getUser(emailCampaign.userWhoSentItKey).then(userSnap => {
        let userWhoSent = userSnap.data();
        // createMailTransport(userWhoSent.googleEmail, Buffer.from(userWhoSent.googlePassword, 'base64').toString());

        // let mailTransport = nodemailer.createTransport("SMTP",{
        //   service: "Gmail",
        //   auth: {
        //     user: userWhoSent.googleEmail,
        //     pass: Buffer.from(userWhoSent.googlePassword, 'base64').toString()
        //   }
        // });
        return generateEmailAsyncFunction(emails, emailCampaign, userWhoSent);
      }).catch((err) => {
        console.log('error sending error email!!!!: ' + err);
      });
    }).catch((err) => {
      console.log('error sending error email!!!!: ' + err);
    });
  }).catch((err) => {
    console.log('error sending error email!!!!: ' + err);
  });

});

exports.sendSoloEmail = functions.firestore.document('send_solo_email/{pushId}').onCreate(event => {
  const data = event.data.data();
  const id = event.params.pushId;
  console.log(id);
  return generateSoloEmail(data, id).then(() => {
    console.log('email sent success');
  }).catch((err) => {
    console.log('error sending error email!!!!: ' + err);
  });
});

exports.sendTestEmail = functions.firestore.document('send_test_email/{pushId}').onCreate(event => {
  let testEmail = {
    subject: '',
    useSignature: true,
    signature: '',
    body: '',
    to: '',
    sentBy: '',
    fromName: '',
    googleEmail: '',
    googlePassword: ''
  };
  const data = event.data.data();

  return sendTestEmail(data).then(() => {
    console.log('email sent success');
  }).catch((err) => {
    console.log('error sending error email!!!!: ' + err);
    return getMessageToken(data.sentBy).then(mt => {
      const payload = {
        notification: {
          title: `ERROR SENDING TEST EMAIL!`,
          body: `${data.to} - ${data.subject}`,
          icon: "https://firebasestorage.googleapis.com/v0/b/sp-puggl-app.appspot.com/o/error.png?alt=media&token=dfd33981-bc1b-4ed9-82f0-ec42246953db"
        }
      };

      let mtData = mt.data();
      return fbAdmin.messaging().sendToDevice(mtData[data.sentBy], payload);
    });
  });
});

exports.fcmSend = functions.firestore.document('/email_tracker_views/{pushId}').onCreate(event => {
  const view = event.data.data();

  if(view.emailCampaignKey == 'solo_email') {
    return getPerson(view.receiverKey, view.receiverType).then(person => {
      let personData = person.data();

      return getMessageToken(view.sentBy).then(mt => {
        var name = '';
        if(view.receiverType == 'people') {
          name = personData.firstName + ' ' + personData.lastName;
        }
        else {
          name = personData.name;
        }
        let clickAction = `https://app.pug.gl/${view.receiverType}/${view.receiverKey}`;

        const payload = {
          notification: {
            title: `Solo Email View!`,
            body: `${name} - ${personData.email}`,
            click_action: clickAction,
            icon: "https://firebasestorage.googleapis.com/v0/b/prod-storagepug-landing-page.appspot.com/o/pug%20body.png?alt=media&token=e7acedd3-944b-4249-a460-8d8b8e160154"
          }
        };

        let mtData = mt.data();
        return fbAdmin.messaging().sendToDevice(mtData[view.sentBy], payload)
      }).catch(err => {
        console.log(err);
      });
    }).catch(err => {
      console.log(err);
    });
  }
  else {
    return getEmailCampaign(view.emailCampaignKey).then(rt => {
      let ec = rt.data();
      return getPerson(view.receiverKey, view.receiverType).then(person => {
        let personData = person.data();
        return getMessageToken(ec.userWhoSentItKey).then(mt => {
          var name = '';
          if(view.receiverType == 'people') {
            name = personData.firstName + ' ' + personData.lastName;
          }
          else {
            name = personData.name;
          }

          const payload = {
            notification: {
              title: `Email Campaign View!`,
              body: `${name} - ${personData.email}: ${ec.name}`,
              click_action: `https://app.pug.gl/email-campaigns/${view.emailCampaignKey}/stats`,
              icon: "https://firebasestorage.googleapis.com/v0/b/prod-storagepug-landing-page.appspot.com/o/pug%20body.png?alt=media&token=e7acedd3-944b-4249-a460-8d8b8e160154"
            }
          };

          let mtData = mt.data();
          return fbAdmin.messaging().sendToDevice(mtData[ec.userWhoSentItKey], payload)
        }).catch(err => {
          console.log(err);
        });
      }).catch(err => {
        console.log(err);
      });
    }).catch(err => {
      console.log(err);
    });
  }
});

exports.fcmSendActivity = functions.firestore.document('/activity/{pushId}').onCreate(event => {
  const activity = event.data.data();
  console.log(activity);

  var type = '';

  if(activity.postedToType == 'Person') {
    type = 'people';
  }
  else if(activity.postedToType == 'Location') {
    type = 'locations';
  }
  else if(activity.postedToType == 'Company') {
    type = 'companies';
  }
  else if(activity.postedToType == 'Parent Company') {
    type = 'parent_companies';
  }

  return getPerson(activity.postedTo, type).then(person => {
    let personData = person.data();
    var name = '';
    var link = '';
    if(!isNullOrUndefined(personData.accountExecutiveKey)) {
      return getMessageToken(personData.accountExecutiveKey).then(mt => {
        if(activity.postedToType == 'Person') {
          name = personData.firstName + ' ' + personData.lastName;
          link = `https://app.pug.gl/people/${person.id}`;
        }
        else if(activity.postedToType == 'Location') {
          link = `https://app.pug.gl/locations/${person.id}`;
          name = personData.name;
        }
        else if(activity.postedToType == 'Company') {
          link = `https://app.pug.gl/companies/${person.id}`;
          name = personData.name;
        }
        else if(activity.postedToType == 'Parent Company') {
          link = `https://app.pug.gl/parent-companies/${person.id}`;
          name = personData.name;
        }

        return getDefaultActivity(activity.type).then((type) => {
          let typeData = type.data();
          const payload = {
            notification: {
              title: `New Activity!`,
              body: `${typeData.name} - ${name}`,
              click_action: link,
              icon: "https://firebasestorage.googleapis.com/v0/b/prod-storagepug-landing-page.appspot.com/o/pug%20body.png?alt=media&token=e7acedd3-944b-4249-a460-8d8b8e160154"
            }
          };

          let mtData = mt.data();
          return fbAdmin.messaging().sendToDevice(mtData[activity.postedBy], payload)
        });
      }).catch(err => {
        console.log(err);
      });
    }

  }).catch(err => {
    console.log(err);
  });

});

exports.resendEmail = functions.https.onRequest((req, res) => {
  var emailTrackerKey = req.query.emailTrackerKey;
  res.set("Access-Control-Allow-Origin", "*");

  getEmailTracker(emailTrackerKey).then((querySnapshot) => {
    let emailTracker = querySnapshot.data();
    emailTracker.id = querySnapshot.id;
    getEmailCampaign(emailTracker.emailCampaignKey).then(emailCampaignSnap => {
      let emailCampaign = emailCampaignSnap.data();
      emailCampaign.id = emailCampaignSnap.id;
      getUser(emailCampaign.userWhoSentItKey).then(userSnap => {
        let userWhoSent = userSnap.data();
        resendEmail(emailTracker, emailCampaign, userWhoSent, res);
      });
    });
  });
});

exports.getCompanies = functions.https.onRequest((req, res) => {
  let companies = [];
  var count = 0;
  res.set("Access-Control-Allow-Origin", "*");
  getCompanies().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      tmp.cacheId = count;
      count++;
      companies.push(tmp);
    });
    res.send(companies);
  })
});

exports.getPeople = functions.https.onRequest((req, res) => {
  let people = [];
  var count = 0;
  res.set("Access-Control-Allow-Origin", "*");
  getPeople().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      tmp.cacheId = count;
      count++;
      people.push(tmp);
    });
    res.send(people);
  })
});

exports.getParentCompanies = functions.https.onRequest((req, res) => {
  let pc = [];
  var count = 0;
  res.set("Access-Control-Allow-Origin", "*");
  getParentCompanies().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      tmp.cacheId = count;
      count++;
      pc.push(tmp);
    });
    res.send(pc);
  })
});

exports.getLocations = functions.https.onRequest((req, res) => {
  let locations = [];
  var count = 0;
  res.set("Access-Control-Allow-Origin", "*");
  getLocations().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      tmp.cacheId = count;
      count++;
      locations.push(tmp);
    });
    res.send(locations);
  })
});

exports.getEmailLists = functions.https.onRequest((req, res) => {
  let data = [];
  res.set("Access-Control-Allow-Origin", "*");
  getEmailLists().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      data.push(tmp);
    });
    res.send(data);
  })
});

exports.getEmailCampaigns = functions.https.onRequest((req, res) => {
  let data = [];
  res.set("Access-Control-Allow-Origin", "*");
  getEmailCampaigns().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      data.push(tmp);
    });
    res.send(data);
  })
});

exports.getEmailTemplates = functions.https.onRequest((req, res) => {
  let data = [];
  res.set("Access-Control-Allow-Origin", "*");
  getEmailTemplates().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      data.push(tmp);
    });
    res.send(data);
  })
});

exports.getUsers = functions.https.onRequest((req, res) => {
  let data = [];
  res.set("Access-Control-Allow-Origin", "*");
  getUsers().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      data.push(tmp);
    });
    res.send(data);
  })
});

exports.buildLeads = functions.https.onRequest((req, res) => {
  let data = [];
  res.set("Access-Control-Allow-Origin", "*");
  getEmailTrackers().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      tmp.views = getEmailTrackerViews(tmp.id);
      tmp.clicks = getEmailTrackerClicks(tmp.id);
      data.push(tmp);
    });
    res.send(data);
  })
});

exports.getShortUrls = functions.https.onRequest((req, res) => {
  let data = [];
  res.set("Access-Control-Allow-Origin", "*");
  getShortUrls().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      data.push(tmp);
    });
    res.send(data);
  })
});

exports.getSources = functions.https.onRequest((req, res) => {
  let data = [];
  res.set("Access-Control-Allow-Origin", "*");
  getSources().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      data.push(tmp);
    });
    res.send(data);
  })
});

exports.getActivityTypes = functions.https.onRequest((req, res) => {
  let data = [];
  res.set("Access-Control-Allow-Origin", "*");
  getActivityTypes().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      data.push(tmp);
    });
    res.send(data);
  })
});

exports.getDealStages = functions.https.onRequest((req, res) => {
  let data = [];
  res.set("Access-Control-Allow-Origin", "*");
  getDealStages().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      data.push(tmp);
    });
    res.send(data);
  })
});

exports.getSoftwareTypes = functions.https.onRequest((req, res) => {
  let data = [];
  res.set("Access-Control-Allow-Origin", "*");
  getSoftwareTypes().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      data.push(tmp);
    });
    res.send(data);
  })
});

exports.getRecentActivity = functions.https.onRequest((req, res) => {
  let data = [];
  res.set("Access-Control-Allow-Origin", "*");
  getRecentActivity().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      data.push(tmp);
    });
    res.send(data);
  })
});

exports.getRecentEmailsViewsThisWeek = functions.https.onRequest((req, res) => {
  let data = [];
  res.set("Access-Control-Allow-Origin", "*");
  getRecentEmailsViewsThisWeek().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      data.push(tmp);
    });
    res.send(data);
  })
});

exports.getEmailTrackersForAType = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  var receiverKey = req.query.receiverKey;
  var receiverType = req.query.receiverType;
  if(isNullOrUndefined(receiverType) || isNullOrUndefined(receiverKey)) {
    res.json([]);
  }
  getPerson(receiverKey, receiverType).then((doc) => {
    let person = doc.data();
    person.id = doc.id;
    getEmailTrackersForAType(receiverKey, receiverType).then((querySnapshot) => {
      let emailTrackers = [];
      querySnapshot.forEach((doc) => {
        let tmp = doc.data();
        tmp.id = doc.id;
        emailTrackers.push(tmp);
      });
      buildEmailTrackersForAPerson(person, emailTrackers, res);
    });
  });
});

exports.getEmailTrackersForATypeAndNoOneElse = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  var receiverKey = req.query.receiverKey;
  var receiverType = req.query.receiverType;
  if(isNullOrUndefined(receiverType) || isNullOrUndefined(receiverKey)) {
    res.json([]);
  }
  getEmailTrackersForAType(receiverKey, receiverType).then((querySnapshot) => {
    buildEmailTrackers(querySnapshot, res);
  });
});

exports.getTodosForAType = functions.https.onRequest((req, res) => {
  let data = [];
  res.set("Access-Control-Allow-Origin", "*");
  var receiverKey = req.query.receiverKey;
  var receiverType = req.query.receiverType;

  getTodosForAType(receiverKey, receiverType).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      data.push(tmp);
    });
    res.send(data);
  })
});

exports.getItemsForAccountExecutive = functions.https.onRequest((req, res) => {
  let data = [];
  res.set("Access-Control-Allow-Origin", "*");
  var accountExecutiveKey = req.query.accountExecutiveKey;

  getPeopleForAccountExecutiveUser(accountExecutiveKey).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      tmp.type = 'people';
      data.push(tmp);
    });
    getCompaniesForAccountExecutiveUser(accountExecutiveKey).then((c) => {
      c.forEach((doc) => {
        let tmp = doc.data();
        tmp.type = 'companies';
        tmp.id = doc.id;
        data.push(tmp);
      });
      getLocationsForAccountExecutiveUser(accountExecutiveKey).then((l) => {
        l.forEach((doc) => {
          let tmp = doc.data();
          tmp.id = doc.id;
          tmp.type = 'locations';
          data.push(tmp);
        });
        getParentCompaniesForAccountExecutiveUser(accountExecutiveKey).then((pc) => {
          pc.forEach((doc) => {
            let tmp = doc.data();
            tmp.id = doc.id;
            tmp.type = 'parent_companies';
            data.push(tmp);
          });
          data.sort((a,b) => {
            let aDate = new Date(b.dateUpdated);
            let bDate = new Date(a.dateUpdated);
            return aDate.getTime() - bDate.getTime();
          });

          res.send(data);
        });
      });
    });
  });
});

exports.getHomePageStats = functions.https.onRequest((req, res) => {
  let data = {
    contactsAdded: 0,
    todosAdded: 0,
    emailsSent: 0,
    emailViews: 0
  };
  res.set("Access-Control-Allow-Origin", "*");

  getPeopleAddedThisWeek().then((p) => {
    if(p.docs.length) {
      data.contactsAdded += p.docs.length;
    }
    getLocationsAddedThisWeek().then((l) => {
      if(l.docs.length) {
        data.contactsAdded += l.docs.length;
      }
      getCompaniesAddedThisWeek().then((c) => {
        if(c.docs.length) {
          data.contactsAdded += c.docs.length;
        }
        getParentCompaniesAddedThisWeek().then((pc) => {
          if(pc.docs.length) {
            data.contactsAdded += pc.docs.length;
          }
          getEmailsSentThisWeek().then((e) => {
            if(e.docs.length) {
              data.emailsSent += e.docs.length;
            }
            getEmailsViewsThisWeek().then((ev) => {
              if(ev.docs.length) {
                data.emailViews += ev.docs.length;
              }
              getTodosCreatedThisWeek().then((t) => {
                if(t.docs.length) {
                  data.todosAdded += t.docs.length;
                }
                res.send(data);
              });
            });
          });
        });
      });
    });
  });
});

exports.getDealsForAType = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  var receiverKey = req.query.receiverKey;
  var receiverType = req.query.receiverType;
  let data = [];
  if(isNullOrUndefined(receiverType) || isNullOrUndefined(receiverKey)) {
    res.send([]);
  }
  console.log(receiverKey, receiverType)
  getDealsForAType(receiverKey, receiverType).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      data.push(tmp);
    });
    res.send(data);
  });
});

exports.getRecentDeals = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  let data = [];
  getRecentDeals().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      data.push(tmp);
    });
    res.send(data);
  })
});

exports.getAllDeals = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  let data = [];
  getAllDeals().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      data.push(tmp);
    });
    res.send(data);
  })
});

exports.getAllCustomers = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  let data = [];
  getAllCustomers().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let tmp = doc.data();
      tmp.id = doc.id;
      data.push(tmp);
    });
    res.send(data);
  })
});

exports.getActivityForAItem = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  var receiverKey = req.query.receiverKey;
  var receiverType = req.query.receiverType;
  if(isNullOrUndefined(receiverType) || isNullOrUndefined(receiverKey)) {
    res.send([]);
  }
  getTypeActivity(receiverKey, receiverType).then((querySnapshot) => {
    buildActivityItems(querySnapshot, res);
  })
});

exports.removeAnItem = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  var receiverKey = req.query.receiverKey;
  var receiverType = req.query.receiverType;
  if(isNullOrUndefined(receiverType) || isNullOrUndefined(receiverKey)) {
    res.json([]);
  }
  removeAnItem(receiverKey, receiverType).then((querySnapshot) => {
    res.send({success: 'success'});
  });
});

exports.getEmailTrackersForUser = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  var userKey = req.query.userKey;
  if(isNullOrUndefined(userKey)) {
    res.json([]);
  }
  getEmailTrackersForUser(userKey).then((querySnapshot) => {
    buildEmailTrackers(querySnapshot, res);
  });
});

