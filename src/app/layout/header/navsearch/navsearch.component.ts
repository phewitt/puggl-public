import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChange, ElementRef } from '@angular/core';
import {FirebaseService} from "../../../providers/firebase.service";
import {TypeaheadMatch} from "ngx-bootstrap";
import {Router} from "@angular/router";
declare var $: any;

@Component({
  selector: 'app-navsearch',
  templateUrl: './navsearch.component.html',
  styleUrls: ['./navsearch.component.scss']
})
export class NavsearchComponent implements OnInit, OnChanges {

  @Input() visible: boolean;
  @Output() onclose = new EventEmitter<boolean>();
  term: string;

  constructor(
    public elem: ElementRef,
    public fb: FirebaseService,
    private router: Router
  ) { }

  ngOnInit() {
    $(document)
      .on('keyup', event => {
        if (event.keyCode === 27) {// ESC
          this.closeNavSearch();
        }
      })
      .on('click', event => {
        if (!$.contains(this.elem.nativeElement, event.target)) {
          this.closeNavSearch();
        }
      })
    ;
  }

  typeaheadOnSelect(e: TypeaheadMatch): void {
    console.log('Selected value: ', e.item.link);
    this.router.navigate([e.item.link]);
    this.term = '';
    this.closeNavSearch();
  }

  closeNavSearch() {
    this.visible = false;
    this.onclose.emit();
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    // console.log(changes['visible'].currentValue)
    if (changes['visible'].currentValue === true) {
      this.elem.nativeElement.querySelector('input').focus();
    }
  }

  handleForm() {
    console.log('Form submit: ' + this.term);
  }
}
