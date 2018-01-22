import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatorService } from '../core/translator/translator.service';
import { MenuService } from '../core/menu/menu.service';
import { SharedModule } from '../shared/shared.module';

import { menu } from './menu';
import { routes } from './routes';
import {LoginComponent} from "./login/login.component";
import { LogoutComponent } from './logout/logout.component';
import { ParentCompanyComponent } from './parent-company/parent-company.component';
import { CompaniesComponent } from './companies/companies.component';
import { LocationsComponent } from './locations/locations.component';
import { PeopleComponent } from './people/people.component';
import { ViewParentCompanyComponent } from './view-parent-company/view-parent-company.component';
import { ViewCompanyComponent } from './view-company/view-company.component';
import { ViewLocationComponent } from './view-location/view-location.component';
import { ViewPersonComponent } from './view-person/view-person.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { EmailTemplateEditComponent } from './email-template-edit/email-template-edit.component';
import { EmailTemplatesComponent } from './email-templates/email-templates.component';
import { EmailListsComponent } from './email-lists/email-lists.component';
import { EmailCampaignsComponent } from './email-campaigns/email-campaigns.component';
import { EmailListEditComponent } from './email-list-edit/email-list-edit.component';
import { EmailCampaignEditComponent } from './email-campaign-edit/email-campaign-edit.component';
import { EmailCampaignStatsComponent } from './email-campaign-stats/email-campaign-stats.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ViewAllEmailsComponent } from './view-all-emails/view-all-emails.component';
import { DealsComponent } from './deals/deals.component';
import { CustomersComponent } from './customers/customers.component';
import { ViewLeadsComponent } from './view-leads/view-leads.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forRoot(routes),
  ],
  declarations: [
    LoginComponent,
    LogoutComponent,
    ParentCompanyComponent,
    CompaniesComponent,
    LocationsComponent,
    PeopleComponent,
    ViewParentCompanyComponent,
    ViewCompanyComponent,
    ViewLocationComponent,
    ViewPersonComponent,
    MyProfileComponent,
    EmailTemplateEditComponent,
    EmailTemplatesComponent,
    EmailListsComponent,
    EmailCampaignsComponent,
    EmailListEditComponent,
    EmailCampaignEditComponent,
    EmailCampaignStatsComponent,
    CalendarComponent,
    ViewAllEmailsComponent,
    DealsComponent,
    CustomersComponent,
    ViewLeadsComponent,
  ],
  exports: [
    RouterModule,
    LoginComponent,
    ParentCompanyComponent,
    CompaniesComponent,
    LocationsComponent,
    ViewParentCompanyComponent,
    ViewCompanyComponent,
    ViewLocationComponent,
    ViewPersonComponent,
    MyProfileComponent,
    EmailTemplateEditComponent,
    EmailTemplatesComponent,
    EmailListsComponent,
    EmailCampaignsComponent,
    EmailListEditComponent,
    EmailCampaignEditComponent,
    EmailCampaignStatsComponent,
    CalendarComponent,
    ViewAllEmailsComponent,
    DealsComponent,
    CustomersComponent,
    ViewLeadsComponent,
  ]
})

export class RoutesModule {
  constructor(public menuService: MenuService, tr: TranslatorService) {
    menuService.addMenu(menu);
  }
}
