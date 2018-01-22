import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'date-added-box',
  templateUrl: './date-added-box.component.html',
  styleUrls: ['./date-added-box.component.scss']
})
export class DateAddedBoxComponent implements OnInit {
  @Input() data;

  constructor() { }

  ngOnInit() {
  }

}
