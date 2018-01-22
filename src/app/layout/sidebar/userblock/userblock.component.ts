import { Component, OnInit } from '@angular/core';

import { UserblockService } from './userblock.service';

@Component({
    selector: 'app-userblock',
    templateUrl: './userblock.component.html',
    styleUrls: ['./userblock.component.scss']
})
export class UserblockComponent implements OnInit {
    user: any;

    constructor(public userblockService: UserblockService) {

        this.user = {
            picture: 'https://firebasestorage.googleapis.com/v0/b/prod-storagepug-landing-page.appspot.com/o/Official-Pug-Full-Body-Circle.png?alt=media&token=4bd7786b-eed5-413b-bc09-a5d1181e3027'
        };
    }

    ngOnInit() {
    }

    userBlockIsVisible() {
        return this.userblockService.getVisibility();
    }

}
