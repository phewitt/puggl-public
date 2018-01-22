import { Injectable } from '@angular/core';
import {FirebaseService} from "./firebase.service";
import {Address} from "../models/address";
import {SettingsService} from "../core/settings/settings.service";

@Injectable()
export class SidebarServiceService {

  constructor(
    private fb: FirebaseService,
    private settings: SettingsService
  ) { }

  newItem(type, data) {
    this.fb.sidebarAddress = new Address();
    this.fb.sidebarData = data;
    this.fb.sidebarIsEdit = false;
    this.fb.sidebarForm = type;
    this.settings.layout.offsidebarOpen = true;
  }
}
