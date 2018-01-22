import {Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {FirebaseService} from "../../providers/firebase.service";

@Component({
  selector: 'info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.scss']
})
export class InfoPanelComponent implements OnInit {
  @Input() title;
  @Input() data;

  constructor(
    public fb: FirebaseService
  ) { }

  ngOnInit() {
  }

}
