import {Component, Input, OnInit} from '@angular/core';
import {FirebaseService} from "../../providers/firebase.service";
import {States} from "../../models/states";

@Component({
  selector: 'sidebar-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {
  states = new States();

  filteredCities: any[];
  filteredStates: any[];

  constructor(
    public fb: FirebaseService
  ) { }

  ngOnInit() {
    this.filteredStates = this.states.states;
  }

  filter(event, type) {
    let query = event.query;
    if(type == 'cities') {
      var data = this.fb.cities;
    }
    else if(type == 'states') {
      var data = this.states.states;
    }

    let filtered : any[] = [];
    for(let i = 0; i < data.length; i++) {
      let country = data[i];
      if(country.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(country);
      }
    }
    if(type == 'cities') {
      this.filteredCities = filtered;
    }
    else if(type == 'states') {
      this.filteredStates = filtered;
    }

  }
}
