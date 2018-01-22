import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {Router} from "@angular/router";

declare var $: any;

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, AfterViewInit, OnDestroy {
  $calendar: any;

  calendarOptions: any = {
    // isRTL: true,
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    },
    buttonIcons: { // note the space at the beginning
      prev: ' fa fa-caret-left',
      next: ' fa fa-caret-right'
    },
    buttonText: {
      today: 'today',
      month: 'month',
      week: 'week',
      day: 'day'
    },
    editable: false,
    droppable: false,
    eventClick: this.eventClick.bind(this),
    dayClick: this.dayClick.bind(this)
  };

  events = [];

  calendarEvents: Array<any> = this.events;
  selectedEvent = null;

  // reference to the calendar element
  @ViewChild('fullcalendar') fullcalendar: ElementRef;

  constructor(
    private fb: FirebaseService,
    private router: Router
  ) {
    this.calendarOptions.events = this.calendarEvents;
    this.getEvents();
  }

  ngOnInit() {
    this.$calendar = $(this.fullcalendar.nativeElement);
  }

  ngAfterViewInit() {
    // init calendar plugin
    this.$calendar.fullCalendar(this.calendarOptions);
  }

  eventClick(calEvent, jsEvent, view) {
    jsEvent.preventDefault();
    // console.log(calEvent)
    this.router.navigate([calEvent.url]);
    this.selectedEvent = {
      title: calEvent.title,
      start: calEvent.start,
      url: calEvent.url || ''
    };
  }

  dayClick(date, jsEvent, view) {
    this.selectedEvent = {
      date: date.format()
    };
  }

  addEvent(event) {
    // store event
    this.calendarEvents.push(event);
    // display event in calendar
    this.$calendar.fullCalendar('renderEvent', event, true);
  }

  getEvents() {
    this.fb.getAllTodos().subscribe((todos: any) => {
      for(let item of todos) {
        var name = '';
        var url = '';
        if(item.associateToType == 'people') {
          name = this.fb.peopleNameIndex[item.associateToKey].name;
          url = `people/${item.associateToKey}`;
        }
        else if(item.associateToType == 'locations') {
          name = this.fb.locationsNameIndex[item.associateToKey].name;
          url = `locations/${item.associateToKey}`;
        }
        else if(item.associateToType == 'companies') {
          name = this.fb.companiesNameIndex[item.associateToKey].name;
          url = `companies/${item.associateToKey}`;
        }
        else if(item.associateToType == 'parent_companies') {
          name = this.fb.parentCompaniesNameIndex[item.associateToKey].name;
          url = `parent-companies/${item.associateToKey}`;
        }

        this.addEvent({
          title: `${name}: ${this.fb.activityTypesIndex[item.activityTypeKey]} - ${this.fb.userIndex[item.assignToUserKey].name}`,
          start: item.dueDate,
          allDay: false,
          url: url,
          id: item.id,
          backgroundColor: item.complete ? '#607d8b' : '#ff902b', //Blue
          borderColor: item.complete ? '#607d8b' : '#ff902b' //Blue
        });
      }
    });
  }

  ngOnDestroy() {
    this.$calendar.fullCalendar('destroy')
  }
}
