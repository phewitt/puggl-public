import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {Observable} from "rxjs/Observable";
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';
import * as firebase from "firebase";
import Query = firebase.database.Query;
import {LoadingServiceProvider} from "../../providers/loading-service";
import {isUndefined} from "util";

@Component({
  selector: 'info-block-todos',
  templateUrl: './info-block-todos.component.html',
  styleUrls: ['./info-block-todos.component.scss']
})
export class InfoBlockTodosComponent implements OnInit {
  todos: Observable<any>;
  todosCount: Observable<any>;

  today = new Date();
  nextWeek = new Date();


  pastDueCount: number = 0;
  todayCount: number = 0;
  thisWeekCount: number = 0;

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


  constructor(
    public fb: FirebaseService,
    private loading: LoadingServiceProvider
  ) { }

  ngOnInit() {
    this.todos = this.fb.getAllNonCompleteTodos();
    this.todosCount = this.fb.getAllNonCompleteTodos();
    this.nextWeek.setDate(this.nextWeek.getDate() + 7);
    this.updateCount();
  }

  toggleUserKey() {
    // this.fb.showOnlyMyTodos = !this.fb.showOnlyMyTodos;
    this.getTodos();
  }

  toggleShowComplete() {
    // this.fb.showCompleteTodos = !this.fb.showCompleteTodos;
    this.getTodos();
  }

  getTodos() {
    if(this.fb.showCompleteTodos) {
      if(this.fb.showOnlyMyTodos) {
        this.todos = this.fb.getAllMyTodos();
        this.todosCount = this.fb.getAllMyTodos();
      }
      else {
        this.todos = this.fb.getAllTodos();
        this.todosCount = this.fb.getAllTodos();
      }
    }
    else {
      if(this.fb.showOnlyMyTodos) {
        this.todos = this.fb.getAllMyNonCompleteTodos();
        this.todosCount = this.fb.getAllMyNonCompleteTodos();
      }
      else {
        this.todos = this.fb.getAllNonCompleteTodos();
        this.todosCount = this.fb.getAllNonCompleteTodos();
      }
    }
    this.updateCount();
  }

  updateCount() {
    let sub = this.todosCount.subscribe((todos) => {
      this.thisWeekCount = 0;
      this.todayCount = 0;
      this.pastDueCount = 0;

      for(let todo of todos) {
        if((todo.dueDate.getTime()) > (this.today.getTime()) && (todo.dueDate.getTime()) <= (this.nextWeek.getTime())) {
          this.thisWeekCount++
        }
        if((todo.dueDate.getDate()+'+'+todo.dueDate.getMonth() ) == (this.today.getDate()+'+'+this.today.getMonth())) {
          this.todayCount++
        }
        if((todo.dueDate.getTime() ) < (this.today.getTime()) && (todo.dueDate.getDate()+'+'+todo.dueDate.getMonth() ) != (this.today.getDate()+'+'+this.today.getMonth())) {
          this.pastDueCount++
        }
      }

      sub.unsubscribe();
    });
  }

  setNextTodo(todo) {
    this.fb.getItem(todo.associateToKey, todo.associateToType).valueChanges().subscribe((item:any) => {
      this.fb.getNextTodo(todo.associateToKey, todo.associateToType).subscribe((data: any) => {
        if(isUndefined(data)) {
          item.nextTodoDate = '';
          item.nextTodoTypeKey = '';
          item.nextTodoUserKey = '';
        }
        else {
          item.nextTodoDate = data.dueDate;
          item.nextTodoTypeKey = data.activityTypeKey;
          item.nextTodoUserKey = data.assignToUserKey;
        }
        this.fb.updateItem(item, todo.associateToType);
      });
    });
  }

  updateTodo(todo) {
    this.loading.showLoading();

    if(todo.complete == true) {
      this.activity.note = todo.description;
      this.activity.title = todo.title;
      this.activity.person = todo.assignToUserKey;
      this.activity.type = todo.activityTypeKey;
      this.addActivity(todo);
    }

    this.fb.updateTodo(todo).then(() => {
      this.fb.openSnackBar('New Todo Saved.');
      this.getTodos();
      this.setNextTodo(todo);
      this.loading.hideLoading();
    }).catch((e) => {
      this.fb.openSnackBar('Error creating todo.');
      this.loading.hideLoading();
      console.log(e)
    });
  }

  addActivity(todo) {
    this.fb.error = '';
    this.activity.date = new Date();
    this.activity.postedTo = todo.associateToKey;
    var type;

    if(todo.associateToType == 'companies') {
      this.activity.postedToType = 'Company';
      type = this.fb.getCompany(todo.associateToKey).snapshotChanges()
        .map(a => {
            const data = a.payload.data();
            const id = a.payload.id;
            return { id, ...data };
        });
    }
    else if(todo.associateToType == 'parent_companies') {
      this.activity.postedToType = 'Parent Company';
      type = this.fb.getParentCompany(todo.associateToKey).snapshotChanges()
        .map(a => {
          const data = a.payload.data();
          const id = a.payload.id;
          return { id, ...data };
        });
    }
    else if(todo.associateToType == 'locations') {
      this.activity.postedToType = 'Location';
      type = this.fb.getLocation(todo.associateToKey).snapshotChanges()
        .map(a => {
          const data = a.payload.data();
          const id = a.payload.id;
          return { id, ...data };
        });
    }
    else if(todo.associateToType == 'people') {
      this.activity.postedToType = 'Person';
      type = this.fb.getPerson(todo.associateToKey).snapshotChanges()
        .map(a => {
          const data = a.payload.data();
          const id = a.payload.id;
          return { id, ...data };
        });
    }

    if(this.activity.type == '') {
      this.fb.error = 'Activity Type and Note are required';
    }
    else {
      let sub = type.subscribe((data) => {
        sub.unsubscribe();
        this.fb.saveActivity(this.activity, data, todo.associateToType).then(() => {
          this.activity.person = '';
          this.activity.type = '';
          this.activity.note = '';
          this.activity.postedTo = '';
          this.activity.postedToType = '';
        }).catch(e => {
          this.fb.openSnackBar('Error.');
        });
      })
    }
  }
}
