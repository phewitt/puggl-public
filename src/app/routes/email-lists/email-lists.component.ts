import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-email-lists',
  templateUrl: './email-lists.component.html',
  styleUrls: ['./email-lists.component.scss']
})
export class EmailListsComponent implements OnInit {
  public emailLists: Observable<any>;

  constructor(
    public fb: FirebaseService
  ) { }

  ngOnInit() {
    this.emailLists = this.fb.getEmailLists();
  }

}
