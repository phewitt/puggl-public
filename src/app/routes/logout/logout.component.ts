import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(
    private fb: FirebaseService
  ) { }

  ngOnInit() {
    this.fb.logout();
  }

}
