import './vendor.ts';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import {AppModule} from "./app/app.module";
import {enableProdMode} from "@angular/core";

if (environment.production) {
    enableProdMode();
}


// platformBrowserDynamic().bootstrapModule(AppModule);

let p = platformBrowserDynamic().bootstrapModule(AppModule);
p.then(() => { (<any>window).appBootstrap && (<any>window).appBootstrap(); })
// .catch(err => console.error(err));
