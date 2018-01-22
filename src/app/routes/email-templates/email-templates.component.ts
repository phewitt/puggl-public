import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-email-templates',
  templateUrl: './email-templates.component.html',
  styleUrls: ['./email-templates.component.scss']
})
export class EmailTemplatesComponent implements OnInit {
  public emailTemplates: Observable<any>;

  constructor(
    public fb: FirebaseService
  ) { }

  ngOnInit() {
    this.emailTemplates = this.fb.getEmailTemplates();
  }

}
