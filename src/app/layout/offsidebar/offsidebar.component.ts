import { Component, OnInit, OnDestroy } from '@angular/core';
declare var $: any;

import { SettingsService } from '../../core/settings/settings.service';
import { ThemesService } from '../../core/themes/themes.service';
import { TranslatorService } from '../../core/translator/translator.service';
import {FirebaseService} from "../../providers/firebase.service";

@Component({
  selector: 'app-offsidebar',
  templateUrl: './offsidebar.component.html',
  styleUrls: ['./offsidebar.component.scss']
})
export class OffsidebarComponent implements OnInit, OnDestroy {

  currentTheme: any;
  selectedLanguage: string;
  clickEvent = 'click.offsidebar';
  $doc: any = null;
  error: string;

  constructor(
    public settings: SettingsService,
    public themes: ThemesService,
    public translator: TranslatorService,
    public fb: FirebaseService
  ) {
    this.currentTheme = themes.getDefaultTheme();
    // this.selectedLanguage = this.getLangs()[0].code;
  }

  ngOnInit() {
    setTimeout(() => {
      this.anyClickClose();
    }, 100);
  }

  // getLangs() {
  //   return this.translator.getAvailableLanguages();
  // }

  anyClickClose() {
    this.$doc = $(document).on(this.clickEvent, (e) => {
      if (!$(e.target).parents('.offsidebar').length && !$(e.target).parents('.bs-datepicker-body').length) {
        this.settings.layout.offsidebarOpen = false;
        // $('#app-root').removeClass('offsidebar-open');
      }
    });
  }

  ngOnDestroy() {
    if (this.$doc)
      this.$doc.off(this.clickEvent);
  }
}
