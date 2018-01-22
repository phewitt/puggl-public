import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabPeopleComponent } from './tab-people.component';

describe('TabPeopleComponent', () => {
  let component: TabPeopleComponent;
  let fixture: ComponentFixture<TabPeopleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabPeopleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabPeopleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
