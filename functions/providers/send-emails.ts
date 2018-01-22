import {isNullOrUndefined} from "util";
import {getEmailTracker, saveEmailTracker} from "./firebase";
import {emailObserver, sg} from "../config";
const nodemailer = require('nodemailer');



export const sendEmailForView = (data, emailTrackerId) => {
  // if(!isNullOrUndefined(data.sendAs)) {
  //   var mailOptions = {
  //     from: data.fromName+' <'+data.sendAs+'>',
  //     to: data.to
  //   };
  // }
  // else {
  //
  // }

  var mailOptions = {
    from: data.fromName+' <'+data.fromEmail+'>',
    to: data.to,
    trackingSettings: {
      click_tracking: {
        enable: false
      },
      open_tracking: {
        enable: false
      },
      subscription_tracking: {
        enable: false
      },
      ganalytics: {
        enable: false
      }
    }
  };

  if(!isNullOrUndefined(data.cc)) {
    mailOptions['cc'] = `${data.cc}`;
  }

  mailOptions['subject'] = `${data.subject}`;

  mailOptions['html'] = `<!DOCTYPE html><html><head> <title></title> <meta charset='utf-8'> <meta name='viewport' content='width=device-width, initial-scale=1'> <meta http-equiv='X-UA-Compatible' content='IE=edge'/> <style type='text/css'> /* CLIENT-SPECIFIC STYLES */ body, table, td, a{-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}/* Prevent WebKit and Windows mobile changing default text sizes */ table, td{mso-table-lspace: 0pt; mso-table-rspace: 0pt;}/* Remove spacing between tables in Outlook 2007 and up */ img{-ms-interpolation-mode: bicubic;}/* Allow smoother rendering of resized image in Internet Explorer */ /* RESET STYLES */ img{border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none;}table{border-collapse: collapse !important;}body{height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important;}/* iOS BLUE LINKS */ a[x-apple-data-detectors]{color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important;}/* MOBILE STYLES */ @media screen and (max-width: 525px){/* ALLOWS FOR FLUID TABLES */ .wrapper{width: 100% !important; max-width: 100% !important;}/* ADJUSTS LAYOUT OF LOGO IMAGE */ .logo img{margin: 0 auto !important;}/* USE THESE CLASSES TO HIDE CONTENT ON MOBILE */ .mobile-hide{display: none !important;}.img-max{max-width: 100% !important; width: 100% !important; height: auto !important;}/* FULL-WIDTH TABLES */ .responsive-table{width: 100% !important;}/* UTILITY CLASSES FOR ADJUSTING PADDING ON MOBILE */ .padding{padding: 10px 5% 15px 5% !important;}.padding-meta{padding: 30px 5% 0px 5% !important; text-align: center;}.padding-copy{padding: 10px 5% 10px 5% !important; text-align: center;}.no-padding{padding: 0 !important;}.section-padding{padding: 50px 15px 50px 15px !important;}/* ADJUST BUTTONS ON MOBILE */ .mobile-button-container{margin: 0 auto; width: 100% !important;}.mobile-button{padding: 15px !important; border: 0 !important; font-size: 16px !important; display: block !important;}}/* ANDROID CENTER FIX */ div[style*='margin: 16px 0;']{margin: 0 !important;}</style></head>
        <title>${data.subject}</title>
        <body style='margin: 0 !important; padding: 0 !important;'>
       ${data.email}
       <img src="${data.emailTrackerLink}" />
       ${data.footer}
       </body></html>`;

  mailOptions['categories'] = [data.fromEmail, 'pug.gl'];

  console.log(mailOptions);
  return sg.send(mailOptions).then((info) => {
    console.log('Message sent: ');
  }).catch((error) => {
    console.log('There was an error!!!');
    console.log(error);
    return getEmailTracker(emailTrackerId).then(et => {
      let data = et.data();
      data.error = true;
      console.log(data);
      saveEmailTracker(data, et.id);
    });
  });
  // return sendMail(mailOptions, emailTrackerId, data);
  // return mailTransport.sendMail(mailOptions, (error, info) => {
  //   console.log('Message sent: ');
  //   console.log(error);
  //   if(error) {
  //     console.log('There was an error!!!');
  //     getEmailTracker(emailTrackerId).then(et => {
  //       data = et.data();
  //       data.error = true;
  //       console.log(data);
  //       saveEmailTracker(data, et.id);
  //     });
  //   }
  // });
};

export const resendEmailForView = (data, emailTrackerId, res) => {
  let mailTransport = nodemailer.createTransport(`smtps://${data.googleEmail}:${data.googlePassword}@smtp.gmail.com`);
  let mailOptions = {
    from: '"'+data.fromName+'" <'+data.googleEmail+'>',
    to: data.to,
    trackingSettings: {
      click_tracking: {
        enable: false
      },
      open_tracking: {
        enable: false
      },
      subscription_tracking: {
        enable: false
      },
      ganalytics: {
        enable: false
      }
    }
  };

  if(!isNullOrUndefined(data.cc)) {
    mailOptions['cc'] = `${data.cc}`;
  }

  mailOptions['subject'] = `${data.subject}`;

  mailOptions['html'] = `<!DOCTYPE html><html><head> <title></title> <meta charset='utf-8'> <meta name='viewport' content='width=device-width, initial-scale=1'> <meta http-equiv='X-UA-Compatible' content='IE=edge'/> <style type='text/css'> /* CLIENT-SPECIFIC STYLES */ body, table, td, a{-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}/* Prevent WebKit and Windows mobile changing default text sizes */ table, td{mso-table-lspace: 0pt; mso-table-rspace: 0pt;}/* Remove spacing between tables in Outlook 2007 and up */ img{-ms-interpolation-mode: bicubic;}/* Allow smoother rendering of resized image in Internet Explorer */ /* RESET STYLES */ img{border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none;}table{border-collapse: collapse !important;}body{height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important;}/* iOS BLUE LINKS */ a[x-apple-data-detectors]{color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important;}/* MOBILE STYLES */ @media screen and (max-width: 525px){/* ALLOWS FOR FLUID TABLES */ .wrapper{width: 100% !important; max-width: 100% !important;}/* ADJUSTS LAYOUT OF LOGO IMAGE */ .logo img{margin: 0 auto !important;}/* USE THESE CLASSES TO HIDE CONTENT ON MOBILE */ .mobile-hide{display: none !important;}.img-max{max-width: 100% !important; width: 100% !important; height: auto !important;}/* FULL-WIDTH TABLES */ .responsive-table{width: 100% !important;}/* UTILITY CLASSES FOR ADJUSTING PADDING ON MOBILE */ .padding{padding: 10px 5% 15px 5% !important;}.padding-meta{padding: 30px 5% 0px 5% !important; text-align: center;}.padding-copy{padding: 10px 5% 10px 5% !important; text-align: center;}.no-padding{padding: 0 !important;}.section-padding{padding: 50px 15px 50px 15px !important;}/* ADJUST BUTTONS ON MOBILE */ .mobile-button-container{margin: 0 auto; width: 100% !important;}.mobile-button{padding: 15px !important; border: 0 !important; font-size: 16px !important; display: block !important;}}/* ANDROID CENTER FIX */ div[style*='margin: 16px 0;']{margin: 0 !important;}</style></head>
        <title>${data.subject}</title>
        <body style='margin: 0 !important; padding: 0 !important;'>
       ${data.email}
       <img src="${data.emailTrackerLink}" />
       ${data.footer}
       </body></html>`;
  mailOptions['categories'] = [data.googleEmail, 'pug.gl'];

  return sg
    .send(mailOptions)
    .then(() => {
        console.log('Mail sent successfully');
      getEmailTracker(emailTrackerId).then(et => {
        data = et.data();
        data.error = false;
        console.log(data);
        saveEmailTracker(data, et.id);
      });
    })
    .catch(error => {
        console.error(error.toString());
      console.log('There was an error!!!');
      getEmailTracker(emailTrackerId).then(et => {
        data = et.data();
        data.error = true;
        console.log(data);
        saveEmailTracker(data, et.id);
      });
    });

  // return mailTransport.sendMail(mailOptions, (error, info) => {
  //   console.log('Message sent: ');
  //   console.log(error);
  //   if(error) {
  //
  //   }
  //   else {
  //
  //   }
  //   res.send({status: "success"});
  // });
};

export const sendTestEmail = (data) => {
  let mailOptions = {
    from: data.fromName+' <'+data.googleEmail+'>',
    to: data.to,
    trackingSettings: {
      click_tracking: {
        enable: false
      },
      open_tracking: {
        enable: false
      },
      subscription_tracking: {
        enable: false
      },
      ganalytics: {
        enable: false
      }
    }
  };

  mailOptions['subject'] = `${data.subject}`;

  mailOptions['html'] = `<!DOCTYPE html><html><head> <title></title> <meta charset='utf-8'> <meta name='viewport' content='width=device-width, initial-scale=1'> <meta http-equiv='X-UA-Compatible' content='IE=edge'/> <style type='text/css'> /* CLIENT-SPECIFIC STYLES */ body, table, td, a{-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}/* Prevent WebKit and Windows mobile changing default text sizes */ table, td{mso-table-lspace: 0pt; mso-table-rspace: 0pt;}/* Remove spacing between tables in Outlook 2007 and up */ img{-ms-interpolation-mode: bicubic;}/* Allow smoother rendering of resized image in Internet Explorer */ /* RESET STYLES */ img{border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none;}table{border-collapse: collapse !important;}body{height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important;}/* iOS BLUE LINKS */ a[x-apple-data-detectors]{color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important;}/* MOBILE STYLES */ @media screen and (max-width: 525px){/* ALLOWS FOR FLUID TABLES */ .wrapper{width: 100% !important; max-width: 100% !important;}/* ADJUSTS LAYOUT OF LOGO IMAGE */ .logo img{margin: 0 auto !important;}/* USE THESE CLASSES TO HIDE CONTENT ON MOBILE */ .mobile-hide{display: none !important;}.img-max{max-width: 100% !important; width: 100% !important; height: auto !important;}/* FULL-WIDTH TABLES */ .responsive-table{width: 100% !important;}/* UTILITY CLASSES FOR ADJUSTING PADDING ON MOBILE */ .padding{padding: 10px 5% 15px 5% !important;}.padding-meta{padding: 30px 5% 0px 5% !important; text-align: center;}.padding-copy{padding: 10px 5% 10px 5% !important; text-align: center;}.no-padding{padding: 0 !important;}.section-padding{padding: 50px 15px 50px 15px !important;}/* ADJUST BUTTONS ON MOBILE */ .mobile-button-container{margin: 0 auto; width: 100% !important;}.mobile-button{padding: 15px !important; border: 0 !important; font-size: 16px !important; display: block !important;}}/* ANDROID CENTER FIX */ div[style*='margin: 16px 0;']{margin: 0 !important;}</style></head>
        <title>${data.subject}</title>
        <body style='margin: 0 !important; padding: 0 !important;'>
       ${data.body}
       ${data.signature}
       </body></html>`;

  mailOptions['categories'] = [data.googleEmail, 'pug.gl', 'pug.gl Test Email'];

  return sg
    .send(mailOptions)
    .then(() => console.log('Mail sent successfully'))
    .catch(error => console.error(error.toString()));

  // return mailTransport.sendMail(mailOptions, function(error, info){
  //   console.log('Message sent: ');
  //   console.log(error);
  //   if(error) {
  //     console.log('There was an error!!!')
  //   }
  // });
};
