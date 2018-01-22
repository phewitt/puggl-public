import {
  getEmailCampaign, getEmailCounter, getEmailTemplate, getPerson, getUser, savePerson,
  updateEmailCounter
} from "./firebase";
import {resendEmailForView, sendEmailForView} from "./send-emails";
import {generateEmailTracker, generateEmailTrackerNoEmailCampaign} from "./email-tracker";
import {shorten} from "../function-defs";
import {isNullOrUndefined} from "util";
import {createMailTransport} from "../config";
const nodemailer = require('nodemailer');

export const generateSoloEmail = (data, soloEmailId) => {
  return getEmailCounter().then(doc => {
    updateEmailCounter();
    let counter = doc.data().seq;
    let emailTemplate = data.body;

    return getUser(data.sentBy).then(userSnap => {
      let userWhoSent = userSnap.data();

      return getPerson(data.receiverKey, data.receiverType).then(personSnap => {
        let person = personSnap.data();

        let footer = '';

        if(data.useSignature == true) {
          footer = userWhoSent.emailSignature;
        }
        person.lastEmailSent = new Date();
        savePerson(data.receiverKey, data.receiverType, person);
        createMailTransport(userWhoSent.googleEmail, Buffer.from(userWhoSent.googlePassword, 'base64').toString());


        let emailData = {
          subject: data.subject,
          to: person.email,
          cc: data.cc,
          sendAs: data.sendAs,
          fromName: userWhoSent.firstName + ' ' + userWhoSent.lastName,
          fromEmail: userWhoSent.email,
          googleEmail: userWhoSent.googleEmail,
          googlePassword: Buffer.from(userWhoSent.googlePassword, 'base64').toString(),
          footer: footer,
          email: emailTemplate,
          emailTrackerLink: '',
          emailCampaignKey: 'solo_email',
          receiverType: data.receiverType,
          receiverKey: data.receiverKey,
          sentBy: data.sentBy,
          soloEmailId: soloEmailId
        };

        return generateEmailTrackerNoEmailCampaign(emailData, person, counter).then(et => {
          emailData.emailTrackerLink = et.link;
          console.log('email tracker got');

          if(emailData.receiverType == 'people') {
            emailData.email = emailData.email.replace(/\[FirstName\]/g, person.firstName);
            emailData.email = emailData.email.replace(/\[FullName\]/g, person.firstName + ' ' + person.lastName);
          }
          else {
            emailData.email = emailData.email.replace(/\[FirstName\]/g, person.name);
            emailData.email = emailData.email.replace(/\[FullName\]/g, person.name);
          }

          emailData.email = emailData.email.replace(/\[Email\]/g, person.email);

          emailData.email = emailData.email.replace(/\[MyFirstName\]/g, userWhoSent.firstName);
          emailData.email = emailData.email.replace(/\[MyFullName\]/g, userWhoSent.firstName + ' ' + userWhoSent.lastName);
          emailData.email = emailData.email.replace(/\[MyEmail\]/g, userWhoSent.email);

          // Grab any hreftag and get the url so that I can replace them with short URLS
          let regex = /\href="(http[^"]*)"/g;
          let m;
          let replaceData = [];
          var data;
          console.log('regex started got')

          while ((m = regex.exec(emailData.email)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
              regex.lastIndex++;
            }

            m.forEach((match, groupIndex) => {
              if(groupIndex == 0) {
                data = {
                  0: match,
                  1: '',
                  shortUrl: '',
                  index: regex.lastIndex
                };
              }
              else {
                data[1] = match;
                replaceData.push(data);
                data = {
                  0: '',
                  1: '',
                  shortUrl: '',
                  index: ''
                };
              }
            });
          }

          return getShortUrls(replaceData, et.id, emailData.emailCampaignKey).then((replaceData) => {
            for(let longUrl of replaceData) {
              emailData.email = emailData.email.replace(longUrl[1], longUrl.shortUrl);
            }
            // let mailTransport = nodemailer.createTransport(`smtps://${userWhoSent.googleEmail}:${Buffer.from(userWhoSent.googlePassword, 'base64').toString()}@smtp.gmail.com`);

            return sendEmailForView(emailData, et.id);
          });

        }).catch(err => {
          console.log('Error getting document 1', err);
        });


      }).catch(err => {
        console.log('Error getting document 2', err);
      });
    }).catch(err => {
      console.log('Error getting document 3', err);
    });
  }).catch(err => {
    console.log('Error getting document 3', err);
  });
};


export const generateEmailAsyncFunction = async(emails, emailCampaign, userWhoSent) => {
  let count = 0;
  for(let email of emails.docs) {
    count++;
    await generateEmail(email.data(), emailCampaign, userWhoSent).then(() => {
      console.log('finished');
    }).catch((err) => {
      console.log('error sending error email!!!!: ' + err);
    });
    console.log(count, emails.docs.length);
  };

  return count;
};

export const generateEmail = (data, emailCampaign, userWhoSent) => {
  let counter = data.counter;
  return getEmailTemplate(emailCampaign.emailTemplateKey).then(emailTemplateSnap => {
    let emailTemplate = emailTemplateSnap.data();

    return getPerson(data.receiverKey, data.receiverType).then(personSnap => {
      let person = personSnap.data();

      let footer = '';

      if(emailCampaign.showUserSignature == true) {
        footer = userWhoSent.emailSignature;
      }

      let emailData = {
        subject: emailCampaign.subject,
        to: person.email,
        fromName: userWhoSent.firstName + ' ' + userWhoSent.lastName,
        fromEmail: userWhoSent.email,
        googleEmail: userWhoSent.googleEmail,
        googlePassword: Buffer.from(userWhoSent.googlePassword, 'base64').toString(),
        footer: footer,
        email: emailTemplate.email,
        emailTrackerLink: '',
        emailCampaignKey: data.emailCampaignKey,
        receiverType: data.receiverType,
        receiverKey: data.receiverKey,
        sentBy: emailCampaign.userWhoSentItKey
      };
      person.lastEmailSent = new Date();
      if(isNullOrUndefined(person.emailCampaigns)) {
        person.emailCampaigns = [];
      }
      person.emailCampaigns.push(emailCampaign.id);
      savePerson(data.receiverKey, data.receiverType, person);

      return generateEmailTracker(emailData, person, emailCampaign, counter).then(et => {
        emailData.emailTrackerLink = et.link;
        console.log(et.link)
        if(emailData.receiverType == 'people') {
          emailData.email = emailData.email.replace(/\[FirstName\]/g, person.firstName);
          emailData.email = emailData.email.replace(/\[FullName\]/g, person.firstName + ' ' + person.lastName);
        }
        else {
          emailData.email = emailData.email.replace(/\[FirstName\]/g, person.name);
          emailData.email = emailData.email.replace(/\[FullName\]/g, person.name);
        }

        emailData.email = emailData.email.replace(/\[Email\]/g, person.email);

        emailData.email = emailData.email.replace(/\[MyFirstName\]/g, userWhoSent.firstName);
        emailData.email = emailData.email.replace(/\[MyFullName\]/g, userWhoSent.firstName + ' ' + userWhoSent.lastName);
        emailData.email = emailData.email.replace(/\[MyEmail\]/g, userWhoSent.email);

        // Grab any hreftag and get the url so that I can replace them with short URLS
        let regex = /\href="(http[^"]*)"/g;
        let m;
        let replaceData = [];
        var data;

        while ((m = regex.exec(emailData.email)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === regex.lastIndex) {
            regex.lastIndex++;
          }

          m.forEach((match, groupIndex) => {
            if(groupIndex == 0) {
              data = {
                0: match,
                1: '',
                shortUrl: '',
                index: regex.lastIndex
              };
            }
            else {
              data[1] = match;
              replaceData.push(data);
              data = {
                0: '',
                1: '',
                shortUrl: '',
                index: ''
              };
            }
          });
        }

        console.log(replaceData);

        return getShortUrls(replaceData, et.id, emailData.emailCampaignKey).then((replaceData) => {
          for(let longUrl of replaceData) {
            emailData.email = emailData.email.replace(longUrl[1], longUrl.shortUrl);
          }

          return sendEmailForView(emailData, et.id);
        });

      }).catch(err => {
        console.log('Error getting document 1', err);
      });


    }).catch(err => {
      console.log('Error getting document 2', err);
    });
  }).catch(err => {
    console.log('Error getting document 3', err);
  });

};

export const resendEmail = (emailTracker, emailCampaign, userWhoSent, res) => {
  return getEmailTemplate(emailCampaign.emailTemplateKey).then(emailTemplateSnap => {
    let emailTemplate = emailTemplateSnap.data();

    return getPerson(emailTracker.receiverKey, emailTracker.receiverType).then(personSnap => {
      let person = personSnap.data();

      let footer = '';

      if(emailCampaign.showUserSignature == true) {
        footer = userWhoSent.emailSignature;
      }

      let emailData = {
        subject: emailCampaign.subject,
        to: person.email,
        fromName: userWhoSent.firstName + ' ' + userWhoSent.lastName,
        googleEmail: userWhoSent.googleEmail,
        googlePassword: Buffer.from(userWhoSent.googlePassword, 'base64').toString(),
        footer: footer,
        email: emailTemplate.email,
        emailTrackerLink: emailTracker.link,
        emailCampaignKey: emailTracker.emailCampaignKey,
        receiverType: emailTracker.receiverType,
        receiverKey: emailTracker.receiverKey,
        sentBy: emailCampaign.userWhoSentItKey
      };
      person.lastEmailSent = new Date();
      if(isNullOrUndefined(person.emailCampaigns)) {
        person.emailCampaigns = [];
      }

      if(emailData.receiverType == 'people') {
        emailData.email = emailData.email.replace(/\[FirstName\]/g, person.firstName);
        emailData.email = emailData.email.replace(/\[FullName\]/g, person.firstName + ' ' + person.lastName);
      }
      else {
        emailData.email = emailData.email.replace(/\[FirstName\]/g, person.name);
        emailData.email = emailData.email.replace(/\[FullName\]/g, person.name);
      }

      emailData.email = emailData.email.replace(/\[Email\]/g, person.email);

      emailData.email = emailData.email.replace(/\[MyFirstName\]/g, userWhoSent.firstName);
      emailData.email = emailData.email.replace(/\[MyFullName\]/g, userWhoSent.firstName + ' ' + userWhoSent.lastName);
      emailData.email = emailData.email.replace(/\[MyEmail\]/g, userWhoSent.email);

      // Grab any hreftag and get the url so that I can replace them with short URLS
      let regex = /\href="(http[^"]*)"/g;
      let m;
      let replaceData = [];
      var data;

      while ((m = regex.exec(emailData.email)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        m.forEach((match, groupIndex) => {
          if(groupIndex == 0) {
            data = {
              0: match,
              1: '',
              shortUrl: '',
              index: regex.lastIndex
            };
          }
          else {
            data[1] = match;
            replaceData.push(data);
            data = {
              0: '',
              1: '',
              shortUrl: '',
              index: ''
            };
          }
        });
      }

      return getShortUrls(replaceData, emailTracker.id, emailData.emailCampaignKey).then((replaceData) => {
        for(let longUrl of replaceData) {
          emailData.email = emailData.email.replace(longUrl[1], longUrl.shortUrl);
        }

        return resendEmailForView(emailData, emailTracker.id, res);
      });

    }).catch(err => {
      console.log('Error getting document 1', err);
    });
  }).catch(err => {
    console.log('Error getting document 3', err);
  });

};


export const getShortUrls = async (replaceData, emailTrackerId, emailCampaignKey) => {

  for(let longUrl of replaceData) {
    await shorten({
      url: longUrl[1],
      emailTrackerId: emailTrackerId,
      emailCampaignId: emailCampaignKey
    }).then(shortLink => {
      longUrl.shortUrl = shortLink;
    })
  }
  console.log(replaceData);

  return replaceData;
};
