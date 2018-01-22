import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../core/settings/settings.service';
import {environment} from "../../../environments/environment";

@Component({
    selector: '[app-footer]',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
    version: string;

    constructor(public settings: SettingsService) { }

    ngOnInit() {
      this.version = environment.version;
    }

}
