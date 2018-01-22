import { LayoutComponent } from '../layout/layout.component';
import {LoginComponent} from "./login/login.component";
import {LogoutComponent} from "./logout/logout.component";
import {ParentCompanyComponent} from "./parent-company/parent-company.component";
import {CompaniesComponent} from "./companies/companies.component";
import {LocationsComponent} from "./locations/locations.component";
import {PeopleComponent} from "./people/people.component";
import {ViewParentCompanyComponent} from "./view-parent-company/view-parent-company.component";
import {ViewCompanyComponent} from "./view-company/view-company.component";
import {ViewLocationComponent} from "./view-location/view-location.component";
import {ViewPersonComponent} from "./view-person/view-person.component";
import {MyProfileComponent} from "./my-profile/my-profile.component";
import {EmailTemplatesComponent} from "./email-templates/email-templates.component";
import {EmailTemplateEditComponent} from "./email-template-edit/email-template-edit.component";
import {EmailListsComponent} from "./email-lists/email-lists.component";
import {EmailCampaignsComponent} from "./email-campaigns/email-campaigns.component";
import {EmailListEditComponent} from "./email-list-edit/email-list-edit.component";
import {EmailCampaignEditComponent} from "./email-campaign-edit/email-campaign-edit.component";
import {EmailCampaignStatsComponent} from "./email-campaign-stats/email-campaign-stats.component";
import {CalendarComponent} from "./calendar/calendar.component";
import {ViewAllEmailsComponent} from "./view-all-emails/view-all-emails.component";
import {DealsComponent} from "./deals/deals.component";
import {CustomersComponent} from "./customers/customers.component";
import {ViewLeadsComponent} from "./view-leads/view-leads.component";

export const routes = [

  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadChildren: './home/home.module#HomeModule' },
      { path: 'logout', component: LogoutComponent},
      { path: 'profile', component: MyProfileComponent},
      { path: 'calendar', component: CalendarComponent},
      { path: 'email-lists', component: EmailListsComponent},
      { path: 'recent-emails', component: ViewAllEmailsComponent},
      { path: 'email-lists/:emailListKey', component: EmailListEditComponent},
      { path: 'email-campaigns', component: EmailCampaignsComponent},
      { path: 'email-campaigns/:emailCampaignKey', component: EmailCampaignEditComponent},
      { path: 'email-campaigns/:emailCampaignKey/stats', component: EmailCampaignStatsComponent},
      { path: 'email-templates', component: EmailTemplatesComponent},
      { path: 'email-templates/:emailTemplateKey', component: EmailTemplateEditComponent},
      { path: 'parent-companies', component: ParentCompanyComponent},
      { path: 'parent-companies/:parentCompanyKey', component: ViewParentCompanyComponent},
      { path: 'companies', component: CompaniesComponent},
      { path: 'companies/:companyKey', component: ViewCompanyComponent},
      { path: 'locations', component: LocationsComponent},
      { path: 'locations/:locationKey', component: ViewLocationComponent},
      { path: 'people', component: PeopleComponent},
      { path: 'deals', component: DealsComponent},
      { path: 'customers', component: CustomersComponent},
      { path: 'people/:personKey', component: ViewPersonComponent},
      { path: 'leads/:leadType', component: ViewLeadsComponent},
    ]
  },
  { path: 'login', component: LoginComponent },

  // Not found
  { path: '**', redirectTo: 'home' }

];
