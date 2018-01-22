import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'date-updated-box',
  templateUrl: './date-updated-box.component.html',
  styleUrls: ['./date-updated-box.component.scss']
})
export class DateUpdatedBoxComponent implements OnInit {
  @Input() data;

  constructor() { }

  ngOnInit() {
  }

}
