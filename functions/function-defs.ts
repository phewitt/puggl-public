import {
  addClick, addClickToCampain, addClickToEmailTracker, addEmailTrackerView, addEmailTrackerViewToCampaign,
  addUrlToCampaign,
  addUrlToEmailTracker, addviewToEmailTracker, findUrl, findUrlById, getCounter, getEmailCampaign, getEmailTracker,
  getRecentViewsForTracker,
  saveEmailTracker, saveUrl,
  updateCounter, updateRecentView
} from "./providers/firebase";
import {config} from "./config";
import {decode, encode} from "./providers/encode";
import {isNullOrUndefined, isUndefined} from "util";
var path = require('path');
var geoip = require('geoip-lite');

function getClientAddress(request) {
  return (request || '').split(',')[0];
}


export const shorten = (urlData) => {
  var longUrl = urlData.url;
  var emailTrackerId = urlData.emailTrackerId;
  var campaignId = urlData.emailCampaignId;
  var shortUrl = '';

  return findUrl(longUrl).then(snapshot => {
    if (snapshot.docs.length) {
      let id = snapshot.docs[0].id;
      return getEmailTracker(emailTrackerId).then(et => {
        addUrlToEmailTracker(et.id, id);

        if(campaignId != 'solo_email') {
          shortUrl = config.webhost + encode(id) + '/' + encode(emailTrackerId) + '/' + encode(campaignId);
          return getEmailCampaign(campaignId).then(ec => {
            addUrlToCampaign(ec.id, shortUrl);
            return shortUrl;
          }).catch(e => {
            console.log(e);
            return shortUrl;
          });
        }
        else {
          shortUrl = config.webhost + encode(id) + '/' + encode(emailTrackerId);
          return shortUrl;
        }
      }).catch(e => {
        console.log(e)
        return shortUrl;
      });
    }
    else {
      let date = new Date();

      let url = {
        long_url: longUrl,
        created_at: date,
      };

      return getCounter().then(doc => {
        let counter = doc.data().seq;
        return saveUrl(url, counter).then((ret) => {
          updateCounter();

          return getEmailTracker(emailTrackerId).then(et => {
            addUrlToEmailTracker(et.id, counter);

            if(campaignId != 'solo_email') {
              shortUrl = config.webhost + encode(counter) + '/' + encode(emailTrackerId) + '/' + encode(campaignId);
              return getEmailCampaign(campaignId).then(ec => {
                addUrlToCampaign(ec.id, shortUrl);
                return shortUrl;
              }).catch(e => {
                return shortUrl;
              });
            }
            else {
              shortUrl = config.webhost + encode(counter) + '/' + encode(emailTrackerId);
              return shortUrl;
            }
          }).catch(e => {
            return shortUrl;
          });

        });
      }).catch(err => {
        console.log('Error getting document', err);
      });
    }

  }).catch(err => {
    console.log('Error getting documents', err);
  });
};

export const getShortUrl = (req, res, data) => {
  var base58Id = data.encoded_id;
  var id = decode(base58Id);

  findUrlById(id).then(doc => {
    if (!doc.exists) {
      console.log('No such URL!');
      res.redirect(config.redirect);
    } else {
      console.log("URL Found");
      res.redirect(doc.data().long_url);

      var ip = getClientAddress(req.headers['x-forwarded-for']);
      var geo = geoip.lookup(ip);
      var lat = '';
      var lon = '';

      if (geo.ll) {
        lat = geo.ll[0];
        lon = geo.ll[1];
      }
      let date = new Date();
      let click = {
        short_url_id: id,
        clicked_on: date,
        long_url: doc.data().long_url,
        ip: ip,
        city: geo.city || '',
        country: geo.country || '',
        lat: lat,
        lon: lon,
        state: geo.region || '',
        zip: geo.zip || ''
      };
      addClick(click);
    }
  }).catch(err => {
    console.log('Error getting document', err);
  });
};

export const getShortUrlFromEmail = (req, res, data) => {
  console.log(data);
  var base58Id = data.encoded_id;
  var base58EmailId = data.encoded_email_id;
  var base58CampaignId = data.encoded_campaign_id;
  var id = decode(base58Id);
  var emailId = decode(base58EmailId);

  if(base58CampaignId != 'solo_email') {
    var campaignId = decode(base58CampaignId);
  }
  else {
    var campaignId = 0;
  }


  findUrlById(id).then(doc => {
    if (!doc.exists) {
      console.log('No such URL!');
      res.redirect(config.redirect);
    } else {
      console.log(doc.data())
      var ip = getClientAddress(req.headers['x-forwarded-for']);
      res.redirect(doc.data().long_url);

      var geo = geoip.lookup(ip);
      var lat = '';
      var lon = '';

      if (geo.ll) {
        lat = geo.ll[0];
        lon = geo.ll[1];
      }
      getEmailTracker(emailId).then(et => {
        let data = et.data();

        let date = new Date();
        let click = {
          clicked_on: date,
          shortUrlKey: id,
          emailTrackerKey: emailId,
          emailCampaignKey: campaignId || '',
          receiverKey: data.receiverKey,
          receiverType: data.receiverType,
          long_url: doc.data().long_url,
          ip: ip,
          city: geo.city || '',
          country: geo.country || '',
          lat: lat,
          lon: lon,
          state: geo.region || '',
          zip: geo.zip || ''
        };


        addClick(click).then(ref => {

          if(isUndefined(data.shortUrlClicks)) {
            data.shortUrlClicks = [];
          }
          addClickToEmailTracker(et.id, ref.id);

          if(base58CampaignId != 'solo_email') {
            getEmailCampaign(campaignId).then(et => {
              let data = et.data();
              if(isUndefined(data.shortUrlClicks)) {
                data.shortUrlClicks = [];
              }
              addClickToCampain(et.id, doc.data().long_url);
            });
          }
        });
      });
    }
  });
};

export const sendImage = (req, res) => {
  var emailId = req.query.t;

  if (isNullOrUndefined(emailId)) {
    res.status(500).send({error: "There was an error, yo."});
  }
  else {
    emailId = decode(emailId);
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Expires', 0);
  res.sendFile(path.join(__dirname, 'public/img/tiny.png'));

  getEmailTracker(emailId).then(doc => {
    if (!doc.exists) {
      console.log('No such Email Tracker!');
      res.status(500).send({error: `No such Email Tracker!`})
    } else {
      let data = doc.data();
      var date = new Date();
      getRecentViewsForTracker(emailId).then(snapshot => {
        if (snapshot.docs.length) {
          let lastView = snapshot.docs[0].data();
          let lastViewId = snapshot.docs[0].id;
          let viewedDate = new Date(lastView.viewed_on);
          var diff = date.getTime() - viewedDate.getTime();
          var seconds = Math.floor(diff/1000);
          lastView.viewed_on = date;
          updateRecentView(lastViewId, lastView);
        }
        else {
          var seconds = 31;
        }

        if(seconds > 30) {
          console.log('View counted!');
          if (data.isActive) {
            var ip = getClientAddress(req.headers['x-forwarded-for']);
            var geo = geoip.lookup(ip);
            var lat = '';
            var lon = '';


            if (!isNullOrUndefined(geo)) {
              if (!isNullOrUndefined(geo['ll'])) {
                lat = geo.ll[0];
                lon = geo.ll[1];
              }
            }


            let view = {
              email_tracker_id: emailId,
              viewed_on: date,
              emailCampaignKey: data.emailCampaignKey,
              receiverType: data.receiverType,
              receiverKey: data.receiverKey,
              ip: ip,
              city: geo.city || '',
              country: geo.country || '',
              lat: lat,
              lon: lon,
              state: geo.region || '',
              zip: geo.zip || '',
              sentBy: data.sentBy
            };

            addviewToEmailTracker(emailId, view);
            addEmailTrackerView(view).then(viewRt => {

              if(data.emailCampaignKey != 'solo_email') {
                getEmailCampaign(data.emailCampaignKey).then(rt => {
                  addEmailTrackerViewToCampaign(rt.id, {
                    receiverType: data.receiverType,
                    receiverKey: data.receiverKey
                  });
                }).catch((error) => {
                  console.error("Error adding email tracker: ", error);
                });
              }

            }).catch((error) => {
              console.error("Error adding email tracker: ", error);
            });
          }
          else {
            console.log('not Active')
          }
        }
        else {
          console.log('View NOT counted!');
        }
      });

    }
  }).catch((error) => {
    console.error("Error adding email document: ", error);
  });
};

