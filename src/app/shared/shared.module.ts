import {NgModule, ModuleWithProviders} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToasterModule } from 'angular2-toaster/angular2-toaster';

import { AccordionModule } from 'ngx-bootstrap/accordion';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { RatingModule } from 'ngx-bootstrap/rating';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { FlotDirective } from './directives/flot/flot.directive';
import { SparklineDirective } from './directives/sparkline/sparkline.directive';
import { EasypiechartDirective } from './directives/easypiechart/easypiechart.directive';
import { ColorsService } from './colors/colors.service';
import { CheckallDirective } from './directives/checkall/checkall.directive';
import { VectormapDirective } from './directives/vectormap/vectormap.directive';
import { NowDirective } from './directives/now/now.directive';
import { ScrollableDirective } from './directives/scrollable/scrollable.directive';
import { JqcloudDirective } from './directives/jqcloud/jqcloud.directive';
import {
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule, MatInputModule, MatProgressSpinnerModule, MatSliderModule, MatSlideToggleModule,
  MatSnackBarModule
} from "@angular/material";
import {
  AutoCompleteModule, DataTableModule, DialogModule, DropdownModule, EditorModule, GrowlModule, InputMaskModule,
  InputTextareaModule,
  InputTextModule,
  MultiSelectModule, ProgressBarModule,
  SharedModule as PrimeSharedModule, SplitButtonModule, ToggleButtonModule
} from "primeng/primeng";
import {LoadingServiceProvider} from "../providers/loading-service";
import {LoadingDialogComponent} from "../dialogs/loading-dialog/loading-dialog.component";
import {AddressComponent} from "../components/address/address.component";
import {SidebarFormParentCompanyComponent} from "../components/sidebar-form-parent-company/sidebar-form-parent-company.component";
import {SidebarFormCompanyComponent} from "../components/sidebar-form-company/sidebar-form-company.component";
import {SidebarFormLocationComponent} from "../components/sidebar-form-location/sidebar-form-location.component";
import {SidebarFormPersonComponent} from "../components/sidebar-form-person/sidebar-form-person.component";
import {InfoPanelComponent} from "../components/info-panel/info-panel.component";
import {DateAddedBoxComponent} from "../components/date-added-box/date-added-box.component";
import {DateUpdatedBoxComponent} from "../components/date-updated-box/date-updated-box.component";
import {TabCompanyComponent} from "../components/tab-company/tab-company.component";
import {TabPeopleComponent} from "../components/tab-people/tab-people.component";
import {TabParentCompanyComponent} from "../components/tab-parent-company/tab-parent-company.component";
import {TabLocationsComponent} from "../components/tab-locations/tab-locations.component";
import {ActivityComponent} from "../components/activity/activity.component";
import {ToDoListComponent} from "../components/to-do-list/to-do-list.component";
import {FroalaEditorModule, FroalaViewModule} from "angular-froala-wysiwyg";
import {EmailListPeopleComponent} from "../components/email-list-people/email-list-people.component";
import {EmailListLocationsComponent} from "../components/email-list-locations/email-list-locations.component";
import {EmailListCompaniesComponent} from "../components/email-list-companies/email-list-companies.component";
import {EmailListParentCompaniesComponent} from "../components/email-list-parent-companies/email-list-parent-companies.component";
import {EscapeHtmlPipe} from "../pipes/keep-html.pipe";
import {InfoBlockTodosComponent} from "../components/info-block-todos/info-block-todos.component";
import {EmailTrackerStatsBoxComponent} from "../components/email-tracker-stats-box/email-tracker-stats-box.component";
import {InfoBlockRecentActivityComponent} from "../components/info-block-recent-activity/info-block-recent-activity.component";
import {BsDatepickerModule} from "ngx-bootstrap/datepicker/bs-datepicker.module";
import {InfoBoxRecentEmailViewsComponent} from "../components/info-box-recent-email-views/info-box-recent-email-views.component";
import {GoogleCalendarService} from "../providers/google-calendar.service";
import {GCFMiddlewareService} from "../providers/gcfmiddleware.service";
import { HttpCacheModule } from 'ng-http-cache';
import {InfoBoxAccountExecutiveComponent} from "../components/info-box-account-executive/info-box-account-executive.component";
import {DealsComponent} from "../components/deals/deals.component";
import {SidebarFormDealComponent} from "../components/sidebar-form-deal/sidebar-form-deal.component";
import {InfoBoxDealsComponent} from "../components/info-box-deals/info-box-deals.component";
import {SidebarServiceService} from "../providers/sidebar-service.service";
import {HttpClientModule} from "@angular/common/http";


import * as localforage from "localforage";

localforage.config({
  driver      : localforage.INDEXEDDB, // Force WebSQL; same as using setDriver()
  name        : 'crmCache',
  version     : 1.0,
  storeName   : 'items', // Should be alphanumeric, with underscores.
  description : 'some description'
});


// https://angular.io/styleguide#!#04-10
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AccordionModule.forRoot(),
    AlertModule.forRoot(),
    ButtonsModule.forRoot(),
    CarouselModule.forRoot(),
    CollapseModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    ProgressbarModule.forRoot(),
    RatingModule.forRoot(),
    TabsModule.forRoot(),
    TimepickerModule.forRoot(),
    TooltipModule.forRoot(),
    TypeaheadModule.forRoot(),
    BsDatepickerModule.forRoot(),
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    ToasterModule,
    MatInputModule,
    InputTextModule,
    MatDialogModule,
    AutoCompleteModule,
    DataTableModule,
    DropdownModule,
    PrimeSharedModule,
    InputTextareaModule,
    InputMaskModule,
    RouterModule,
    MatSnackBarModule,
    MultiSelectModule,
    EditorModule,
    MatChipsModule,
    MatSlideToggleModule,
    ProgressBarModule,
    DialogModule,
    MatCheckboxModule,
    ToggleButtonModule,
    HttpClientModule,
    HttpCacheModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    SplitButtonModule
  ],
  providers: [
    ColorsService,
    LoadingServiceProvider,
    GoogleCalendarService,
    GCFMiddlewareService,
    SidebarServiceService
  ],
  declarations: [
    FlotDirective,
    SparklineDirective,
    EasypiechartDirective,
    CheckallDirective,
    VectormapDirective,
    NowDirective,
    ScrollableDirective,
    JqcloudDirective,
    LoadingDialogComponent,
    AddressComponent,
    SidebarFormParentCompanyComponent,
    SidebarFormCompanyComponent,
    SidebarFormLocationComponent,
    SidebarFormPersonComponent,
    InfoPanelComponent,
    DateAddedBoxComponent,
    DateUpdatedBoxComponent,
    TabCompanyComponent,
    TabParentCompanyComponent,
    TabPeopleComponent,
    TabLocationsComponent,
    ActivityComponent,
    ToDoListComponent,
    EmailListPeopleComponent,
    EmailListLocationsComponent,
    EmailListCompaniesComponent,
    EmailListParentCompaniesComponent,
    EscapeHtmlPipe,
    InfoBlockTodosComponent,
    EmailTrackerStatsBoxComponent,
    InfoBlockRecentActivityComponent,
    InfoBoxRecentEmailViewsComponent,
    InfoBoxAccountExecutiveComponent,
    DealsComponent,
    SidebarFormDealComponent,
    InfoBoxDealsComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
    AccordionModule,
    AlertModule,
    ButtonsModule,
    CarouselModule,
    CollapseModule,
    BsDropdownModule,
    ModalModule,
    PaginationModule,
    ProgressbarModule,
    RatingModule,
    TabsModule,
    TimepickerModule,
    TooltipModule,
    TypeaheadModule,
    ToasterModule,
    FlotDirective,
    SparklineDirective,
    EasypiechartDirective,
    CheckallDirective,
    VectormapDirective,
    NowDirective,
    ScrollableDirective,
    JqcloudDirective,
    MatInputModule,
    InputTextModule,
    MatDialogModule,
    AddressComponent,
    LoadingDialogComponent,
    SidebarFormParentCompanyComponent,
    AutoCompleteModule,
    PrimeSharedModule,
    DataTableModule,
    SidebarFormCompanyComponent,
    InputTextareaModule,
    InputMaskModule,
    SidebarFormLocationComponent,
    SidebarFormPersonComponent,
    InfoPanelComponent,
    DateAddedBoxComponent,
    DateUpdatedBoxComponent,
    TabCompanyComponent,
    TabParentCompanyComponent,
    TabPeopleComponent,
    TabLocationsComponent,
    DropdownModule,
    MatSnackBarModule,
    ActivityComponent,
    MultiSelectModule,
    ToDoListComponent,
    BsDatepickerModule,
    EditorModule,
    FroalaEditorModule,
    FroalaViewModule,
    EmailListPeopleComponent,
    EmailListLocationsComponent,
    EmailListCompaniesComponent,
    EmailListParentCompaniesComponent,
    MatChipsModule,
    EscapeHtmlPipe,
    MatSlideToggleModule,
    ProgressBarModule,
    DialogModule,
    InfoBlockTodosComponent,
    MatCheckboxModule,
    EmailTrackerStatsBoxComponent,
    InfoBlockRecentActivityComponent,
    InfoBoxRecentEmailViewsComponent,
    ToggleButtonModule,
    HttpClientModule,
    HttpCacheModule,
    MatProgressSpinnerModule,
    InfoBoxAccountExecutiveComponent,
    DealsComponent,
    SidebarFormDealComponent,
    MatSliderModule,
    InfoBoxDealsComponent,
    SplitButtonModule,
  ],
  entryComponents: [
    LoadingDialogComponent
  ]
})

// https://github.com/ocombe/ng2-translate/issues/209
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule
    };
  }
}
