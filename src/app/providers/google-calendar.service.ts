import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {FirebaseService} from "./firebase.service";

declare var gapi: any;

@Injectable()
export class GoogleCalendarService {
  clientId = environment.clientId;
  apiKey = environment.apiKey;
  scopes = ['https://www.googleapis.com/auth/calendar','https://www.googleapis.com/auth/calendar.readonly','https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.metadata', 'https://www.googleapis.com/auth/gmail.modify'];
  logoutUrl = 'https://accounts.google.com/o/oauth2/revoke?token=';

  authorizeButton = document.getElementById('authorize-button');
  signoutButton = document.getElementById('signout-button');

  /*
   * global application state, so it's OK to keep it as field value of a singleton. alternative would be a
   * buitl-in global value store.
   */
  public isAuthenticated: boolean = false;
  public calendarList = [];
  public calenderId = 'primary';

  constructor(
    private http: HttpClient,
    private fb: FirebaseService
  ){
    // check the authentication silently
    this.internalAuthenticate(true);
  }

  login() {
    this.internalAuthenticate(false);
  }

  logout(){
    console.log('proceed logout');
    this.isAuthenticated = false;
    window.fetch(this.logoutUrl + gapi.auth.getToken().access_token);
  }

  private internalAuthenticate(immediate: boolean){
    return this.proceedAuthentication(immediate)
      .then(() => this.initializeGoogleCalendarAPI())
      .catch((error:any) => {
      console.log('authentication failed:');
      console.log(error);
    });
  }

  private proceedAuthentication(immediate:boolean){
    return new Promise((resolve, reject) => {
      console.log('proceed authentication - immediate: ' + immediate);
      gapi.client.setApiKey(this.apiKey);
      var authorisationRequestData =
        {
          'client_id': this.clientId,
          'scope': this.scopes,
          'immediate': immediate
        }
      gapi.auth.authorize(authorisationRequestData,
        (authenticationResult) => {
          if(authenticationResult && !authenticationResult.error){
            this.isAuthenticated = true;
            resolve();
            this.fb.getUserData().valueChanges().subscribe((data: any) => {

            });
          }
          else {
            this.isAuthenticated = false;
            reject();
          }
        }
      );
    });
  }

  getCalendarList() {
      gapi.client.request('https://www.googleapis.com/calendar/v3/users/me/calendarList').then((data) => {
        this.calendarList = data.result.items;
        console.log(this.calendarList)
      })
  }

  listThreads(userId, query, callback) {
    var getPageOfThreads = function(request, result) {
      request.execute(function (resp) {
        result = result.concat(resp.messages);
        var nextPageToken = resp.nextPageToken;
        if (nextPageToken) {
          request = gapi.client.request({
            path: `https://www.googleapis.com/gmail/v1/users/${userId}/messages?pageToken=${nextPageToken}`,
            method: 'GET',
          });
          getPageOfThreads(request, result);
        } else {
          callback(result);
        }
      });
    };
    var request = gapi.client.request({
      path: `https://www.googleapis.com/gmail/v1/users/${userId}/messages`,
      method: 'GET',
    });
    // var request = gapi.client.gmail.users.threads.list({
    //   'userId': userId,
    //   'q': query
    // });
    getPageOfThreads(request, []);
  }

  addNewEvent(event) {
    return gapi.client.request({
      path: `https://www.googleapis.com/calendar/v3/calendars/${this.calenderId}/events`,
      method: 'POST',
      body: event
    });
  }

  updateEvent(event, eventId) {
    return gapi.client.request({
      path: `https://www.googleapis.com/calendar/v3/calendars/${this.calenderId}/events/${eventId}`,
      method: 'PUT',
      body: event
    });
  }

  private initializeGoogleCalendarAPI(){
    return new Promise((resolve, reject) => {
      console.log('initialize Google Calendar API');
      resolve(gapi.client.load('calendar', 'v3'));
    });
  }

}
