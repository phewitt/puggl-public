import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {LoadingServiceProvider} from "../../providers/loading-service";
import {Observable} from "rxjs/Observable";
import {BsDatepickerConfig} from "ngx-bootstrap/datepicker/bs-datepicker.config";
import {GoogleCalendarService} from "../../providers/google-calendar.service";
import {isNullOrUndefined, isUndefined} from "util";
import {GCFMiddlewareService} from "../../providers/gcfmiddleware.service";

declare var $: any;

@Component({
  selector: 'to-do-list',
  templateUrl: './to-do-list.component.html',
  styleUrls: ['./to-do-list.component.scss']
})
export class ToDoListComponent implements OnInit, OnChanges {
  @Input() id;
  @Input() type;
  @Input() data;

  editingTodo = false;
  date = new Date();
  showCompleted = false;
  hasGCalEvent: boolean;
  activityTypes: Observable<any>;
  users: Observable<any>;
  usersSelect: Observable<any>;
  bsConfig: Partial<BsDatepickerConfig>;
  todos: Array<any>;
  calEvent = {};
  oldId = '';
  todo: {
    id?: string,
    title?: string,
    activityTypeKey?: string,
    assignToUserKey?: string,
    assignTo?: Observable<any>,
    dueDate?: Date,
    dueDateEnd?: Date,
    description?: string,
    associateToType?: string,
    associateToKey?: string,
    gCalUserInvites?: Array<any>,
    gCalReminderType?: string,
    gCalReminderTime?: {},
    gCalIsReminder?: boolean,
    gCalEventId?: string,
    complete?: boolean,
    dateAdded?: Date,
    addToGoogleCal?: boolean
  } = {};

  activity = {
    note: '',
    type: '',
    person: '',
    date: new Date(),
    postedTo: '',
    postedToType: '',
    isTodo: true,
    title: ''
  };

  reminderTypes = [
    { label: 'Email', value: 'email'},
    { label: 'Popup', value: 'popup'}
  ];

  reminderTimes = [
    { label: '30 Mins before', value: {'method': '', 'minutes': 30}},
    { label: '1 Hour before', value: {'method': '', 'minutes': 60}},
    { label: '2 Hours before', value: {'method': '', 'minutes': 120}},
    { label: '1 day before', value: {'method': '', 'minutes': 24 * 60}}
  ];

  @ViewChild('lgModal') lgModal;

  constructor(
    public fb: FirebaseService,
    private loading: LoadingServiceProvider,
    public gcal: GoogleCalendarService,
    private gcf: GCFMiddlewareService
  ) { }

  ngOnInit() {
    this.todo.associateToType = this.type;
    this.todo.associateToKey = this.id;
    this.todo.dueDateEnd = new Date();
    this.todo.dueDate = new Date();

    this.todo.dueDate = new Date();
    this.bsConfig = Object.assign({}, { containerClass: 'theme-dark-blue', showWeekNumbers: false});
    this.users = this.fb.getUsers();
    this.usersSelect = this.fb.getUsers();
    this.activityTypes = this.fb.getActivityTypes();
  }

  ngOnChanges() {
    if (!isNullOrUndefined(this.data)) {
      this.data.id = this.id;
      if (this.oldId == '') {
        this.oldId = this.id;
        this.getTodos();
      }
      else if (this.oldId != this.id) {
        this.oldId = this.id;
        this.getTodos();
      }
    }
  }

  getTodos() {
    this.gcf.getTodosForAType(this.id, this.type).toPromise().then((todos:any) => {
      this.todos = [];
      for(let todo of todos) {
        todo.dueDateEnd = new Date(todo.dueDateEnd);
        todo.dueDate = new Date(todo.dueDate);
        todo.dateAdded = new Date(todo.dateAdded);
        this.todos.push(todo);
      }
    });
  }

  addTodo() {
    this.editingTodo = false;
    this.todo.addToGoogleCal = true;
    this.todo.gCalIsReminder = false;
    this.todo.gCalUserInvites = [];
    this.todo.gCalReminderTime = {'method': '', 'minutes': 30};
    this.todo.gCalReminderType = 'email';
    this.todo.title = '';
    this.todo.description = '';
    this.todo.activityTypeKey = '';
    this.todo.assignToUserKey = '';
    this.todo.dueDate = new Date();
    this.todo.dueDate.setDate(this.todo.dueDate.getDate() + 1);
    this.todo.dueDate.setHours(10);
    this.todo.dueDate.setMinutes(0);
    this.todo.dueDateEnd = new Date();
    this.todo.dueDateEnd.setDate(this.todo.dueDateEnd.getDate() + 1);
    this.todo.dueDateEnd.setHours(11);
    this.todo.dueDateEnd.setMinutes(0);
    this.todo.complete = false;
    this.lgModal.show();
  };

  toggleCompleted() {
    this.showCompleted = !this.showCompleted;
  }

  updateDate(e) {
    this.todo.dueDateEnd = new Date(e);
    this.todo.dueDateEnd.setDate(e.getDate());
  }

  setNextTodo() {
    this.fb.getNextTodo(this.id, this.type).subscribe((data: any) => {
      if(isUndefined(data)) {
        this.data.nextTodoDate = '';
        this.data.nextTodoTypeKey = '';
        this.data.nextTodoUserKey = '';
      }
      else {
        this.data.nextTodoDate = data.dueDate;
        this.data.nextTodoTypeKey = data.activityTypeKey;
        this.data.nextTodoUserKey = data.assignToUserKey;
      }
      this.fb.updateItem(this.data, this.type);
    });
  }

  setGoogleCalEvent(type) {
    if(this.type == 'people') {
      this.calEvent['summary'] = `${this.data.firstName} ${this.data.lastName} - ${this.fb.activityTypesIndex[this.todo.activityTypeKey]}`;
    }
    else {
      this.calEvent['summary'] = `${this.data.name} - ${this.fb.activityTypesIndex[this.todo.activityTypeKey]}`;
    }

    this.calEvent['description'] = this.todo.title + ' -- ' + this.todo.description;
    this.calEvent['start'] = {dateTime: this.todo.dueDate};
    this.calEvent['end'] = {dateTime: this.todo.dueDateEnd};
    // this.calEvent['sendNotifications'] = true;

    if(this.todo.gCalUserInvites.length > 0) {
      this.calEvent['attendees'] = [];
      for(let email of this.todo.gCalUserInvites) {
        this.calEvent['attendees'].push({'email': email});
      }
    }

    if(this.todo.gCalIsReminder == true) {
      let tmp = this.todo.gCalReminderTime;
      tmp['method'] = this.todo.gCalReminderType;
      this.calEvent['reminders'] = {
        'useDefault': false,
        'overrides': [
          tmp
        ]
      };
    }

    if(type == 'new') {
      return this.gcal.addNewEvent(this.calEvent);
    }
    else if(type == 'update') {
      // console.log(JSON.stringify(this.calEvent))
      // console.log(this.todo.gCalEventId)
      return this.gcal.updateEvent(this.calEvent, this.todo.gCalEventId);
    }
  }

  saveNewTodo() {
    this.loading.showLoading();
    this.todo.complete = false;
    this.lgModal.hide();
    this.todo.dateAdded = new Date();

    if(this.todo.assignToUserKey != '' && this.todo.activityTypeKey != '' && this.todo.title != '') {
      if(this.todo.addToGoogleCal == true && this.gcal.isAuthenticated == true) {
        this.setGoogleCalEvent('new').then((event) => {
          this.todo.gCalEventId = event.result.id;
          this.fb.addTodo(this.todo).then(() => {
            this.fb.openSnackBar('New Todo Saved.');
            this.setNextTodo();
            this.updateIndexes();
            this.getTodos();
            this.loading.hideLoading();
          }).catch(() => {
            this.fb.openSnackBar('Error creating todo.');
            this.loading.hideLoading();
          });
        });
      }
      else {
        this.fb.addTodo(this.todo).then(() => {
          this.fb.openSnackBar('New Todo Saved.');
          this.setNextTodo();
          this.updateIndexes();
          this.getTodos();
          this.loading.hideLoading();
        }).catch(() => {
          this.fb.openSnackBar('Error creating todo.');
          this.loading.hideLoading();
        });
      }
    }
  }

  updateTodo(todo) {
    if (this.todo.title === '') return;
    if (this.todo.activityTypeKey === '') return;
    if (this.todo.assignToUserKey === '') return;

    this.loading.showLoading();

    if(this.todo.addToGoogleCal == true && this.gcal.isAuthenticated == true) {
      if(this.hasGCalEvent == true) {
        var type = 'update';
      }
      else {
        var type = 'new';
      }
      this.setGoogleCalEvent(type).then((event) => {
        this.todo.gCalEventId = event.result.id;
        this.fb.updateTodo(todo).then(() => {
          this.lgModal.hide();
          this.setNextTodo();
          if(todo.complete == true) {
            this.activity.note = todo.description;
            this.activity.title = todo.title;
            this.activity.person = todo.assignToUserKey;
            this.activity.type = todo.activityTypeKey;
            this.addActivity();
          }
          else {
            this.updateIndexes();
          }
          this.getTodos();
          this.fb.openSnackBar('New Todo Saved.');
          this.loading.hideLoading();
        }).catch((e) => {
          this.fb.openSnackBar('Error updating todo.');
          this.loading.hideLoading();
          console.log(e)
        });
      });
    }
    else {
      this.fb.updateTodo(todo).then(() => {
        this.lgModal.hide();
        this.setNextTodo();
        if(todo.complete == true) {
          this.activity.note = todo.description;
          this.activity.title = todo.title;
          this.activity.person = todo.assignToUserKey;
          this.activity.type = todo.activityTypeKey;
          this.addActivity();
        }
        else {
          this.updateIndexes();
        }
        this.fb.openSnackBar('New Todo Saved.');
        this.loading.hideLoading();
      }).catch((e) => {
        this.fb.openSnackBar('Error updating todo.');
        this.loading.hideLoading();
        console.log(e)
      });
    }
  }

  addActivity() {
    this.fb.error = '';
    this.activity.date = new Date();
    this.activity.postedTo = this.id;

    if(this.type == 'companies') {
      this.activity.postedToType = 'Company';
    }
    else if(this.type == 'parent_companies') {
      this.activity.postedToType = 'Parent Company';
    }
    else if(this.type == 'locations') {
      this.activity.postedToType = 'Location';
    }
    else if(this.type == 'people') {
      this.activity.postedToType = 'Person';
    }

    if(this.activity.type == '') {
      this.fb.error = 'Activity Type and Note are required';
    }
    else {
      this.fb.saveActivity(this.activity, this.data, this.type).then(() => {
        this.activity.person = '';
        this.activity.type = '';
        this.activity.note = '';
        this.activity.postedTo = '';
        this.activity.postedToType = '';
        this.updateIndexes();
      }).catch(e => {
        this.fb.openSnackBar('Error.');
      });
    }
  }

  updateIndexes() {
    if(this.type == 'people') {
      this.fb.setPeopleIndex();
    }
    else if(this.type == 'locations') {
      this.fb.setLocationIndex();
    }
    else if(this.type == 'companies') {
      this.fb.setCompanyIndex();
    }
    else if(this.type == 'parent_companies') {
      this.fb.setParentCompanyIndex();
    }
  }

  editTodo(item, $event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.todo = item;
    this.todo.dueDate = new Date(this.todo.dueDate);
    this.editingTodo = true;

    // console.log(this.todo)
    if(this.todo.addToGoogleCal == true) {
      this.hasGCalEvent = true;
    }
    else {
      this.hasGCalEvent = false;
    }

    this.lgModal.show();
  };


  totalCompleted() {
    return this.todos.filter(item => {
      return item.complete;
    }).length;
  };

  totalPending() {
    return this.todos.filter(item => {
      return !item.complete;
    }).length;
  };

}
