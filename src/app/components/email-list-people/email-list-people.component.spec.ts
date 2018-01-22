import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailListPeopleComponent } from './email-list-people.component';

describe('EmailListPeopleComponent', () => {
  let component: EmailListPeopleComponent;
  let fixture: ComponentFixture<EmailListPeopleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailListPeopleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailListPeopleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
