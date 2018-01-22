import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {RequestOptions} from "@angular/http";
@Injectable()
export class GCFMiddlewareService {
  headers: any;
  options: any;
  baseUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient
  ) {
    this.headers = new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    this.options = new RequestOptions({headers: this.headers});
  }


  getCompanies() {
    return this.http.get(`${this.baseUrl}getCompanies`, this.options);
  }

  getPeople() {
    return this.http.get(`${this.baseUrl}getPeople`, this.options);
  }

  getParentCompanies() {
    return this.http.get(`${this.baseUrl}getParentCompanies`, this.options);
  }

  getLocations() {
    return this.http.get(`${this.baseUrl}getLocations`, this.options);
  }

  getEmailLists() {
    return this.http.get(`${this.baseUrl}getEmailLists`, this.options);
  }

  getEmailCampaigns() {
    return this.http.get(`${this.baseUrl}getEmailCampaigns`, this.options);
  }

  getEmailTemplates() {
    return this.http.get(`${this.baseUrl}getEmailTemplates`, this.options);
  }

  getUsers() {
    return this.http.get(`${this.baseUrl}getUsers`, this.options);
  }

  getAllCustomers() {
    return this.http.get(`${this.baseUrl}getAllCustomers`, this.options);
  }

  getShortUrls() {
    return this.http.get(`${this.baseUrl}getShortUrls`, this.options);
  }

  getSources() {
    return this.http.get(`${this.baseUrl}getSources`, this.options);
  }

  getActivityTypes() {
    return this.http.get(`${this.baseUrl}getActivityTypes`, this.options);
  }

  getDealStages() {
    return this.http.get(`${this.baseUrl}getDealStages`, this.options);
  }

  getRecentActivity() {
    return this.http.get(`${this.baseUrl}getRecentActivity`, this.options);
  }

  getHomePageStats() {
    return this.http.get(`${this.baseUrl}getHomePageStats`, this.options);
  }

  getRecentEmailsViewsThisWeek() {
    return this.http.get(`${this.baseUrl}getRecentEmailsViewsThisWeek`, this.options);
  }

  getSoftwareTypes() {
    return this.http.get(`${this.baseUrl}getSoftwareTypes`, this.options);
  }

  getRecentDeals() {
    return this.http.get(`${this.baseUrl}getRecentDeals`, this.options);
  }

  getAllDeals() {
    return this.http.get(`${this.baseUrl}getAllDeals`, this.options);
  }

  getTodosForAType(receiverKey, receiverType) {
    return this.http.get(`${this.baseUrl}getTodosForAType?receiverKey=${receiverKey}&receiverType=${receiverType}`, this.options);
  }

  getDealsForAType(receiverKey, receiverType) {
    return this.http.get(`${this.baseUrl}getDealsForAType?receiverKey=${receiverKey}&receiverType=${receiverType}`, this.options);
  }

  removeAnItem(receiverKey, receiverType) {
    console.log('remove')
    return this.http.get(`${this.baseUrl}removeAnItem?receiverKey=${receiverKey}&receiverType=${receiverType}`, this.options);
  }

  getItemsForAccountExecutive(accountExecutiveKey) {
    return this.http.get(`${this.baseUrl}getItemsForAccountExecutive?accountExecutiveKey=${accountExecutiveKey}`, this.options);
  }

  getEmailTrackersForATypeAndNoOneElse(receiverKey, receiverType) {
    return this.http.get(`${this.baseUrl}getEmailTrackersForATypeAndNoOneElse?receiverKey=${receiverKey}&receiverType=${receiverType}`, this.options);
  }

  getEmailTrackersForAType(receiverKey, receiverType) {
    return this.http.get(`${this.baseUrl}getEmailTrackersForAType?receiverKey=${receiverKey}&receiverType=${receiverType}`, this.options);
  }

  getEmailTrackersForUser(userKey) {
    return this.http.get(`${this.baseUrl}getEmailTrackersForUser?userKey=${userKey}`, this.options);
  }

  resendEmail(emailTrackerKey) {
    return this.http.get(`${this.baseUrl}resendEmail?emailTrackerKey=${emailTrackerKey}`, this.options);
  }

  getActivityForAItem(receiverKey, receiverType) {
    return this.http.get(`${this.baseUrl}getActivityForAItem?receiverKey=${receiverKey}&receiverType=${receiverType}`, this.options);
  }
}
