import {getEmailTracker, saveEmailTracker} from "./providers/firebase";
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const smtpPool = require('nodemailer-smtp-pool');
const Rx = require('rxjs/Rx');
const sgMail = require('@sendgrid/mail');

export const sg = sgMail;

// IMPORTANT TO SET THESE VARIABLES FOR FIREBASE and SENDGRID
sgMail.setApiKey(functions.config().sendgrid.apikey);
// firebase functions:config:set conf.emailtracker="https://app.pug.gl/e/img/" conf.webhost="https://app.pug.gl/l/"
var conf = {
  webhost: functions.config().conf.webhost,
  emailTracker: functions.config().conf.emailtracker,
  redirect: 'https://storagepug.com'
};

var mt: any;
export var emailObserver: any;

export var emailObservable = Rx.Observable.create((observer) => {
  emailObserver = observer;
});

var emails = [];

emailObservable.subscribe((data) => {
  emails.push(data);
  // send next message from the pending queue
  while (emails.length) {
    let email = emails.shift();
    console.log(email);
    sgMail.send(email.mailOptions).then((info) => {
      console.log('Message sent: ');
    }).catch((error) => {
      console.log('There was an error!!!');
      console.log(error);
      getEmailTracker(email.emailTrackerId).then(et => {
        let data = et.data();
        data.error = true;
        console.log(data);
        saveEmailTracker(data, et.id);
      });
    });
  }
});

// TODO ADD THIS TO ADMIN PORTAL
export const fromEmail = "hello@storagepug.com";
// TODO ADD THIS TO ADMIN PORTAL
export const fromName = "StoragePug";
export const website = "https://storagepug.com";
export const logoUrl = "https://firebasestorage.googleapis.com/v0/b/prod-storagepug-landing-page.appspot.com/o/Official-Pug-Full-Body-Circle.png?alt=media&token=4bd7786b-eed5-413b-bc09-a5d1181e3027";

export const createMailTransport = (userName, pw) => {
  let smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    pool: true,
    maxConnections: 50,
    maxMessages: 80,
    auth: {
      user: userName,
      pass: pw
    }
  };
  mt = nodemailer.createTransport(smtpPool(smtpConfig));
};



export const sendMail = (mailOptions, emailTrackerId, data) => {
  return mt.sendMail(mailOptions, (error, info) => {
    console.log('Message sent: ');
    console.log(error);
    if(error) {
      console.log('There was an error!!!');
      getEmailTracker(emailTrackerId).then(et => {
        data = et.data();
        data.error = true;
        console.log(data);
        saveEmailTracker(data, et.id);
      });
    }
  });
};

export const config = conf;
