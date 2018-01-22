import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllEmailsComponent } from './view-all-emails.component';

describe('ViewAllEmailsComponent', () => {
  let component: ViewAllEmailsComponent;
  let fixture: ComponentFixture<ViewAllEmailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAllEmailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAllEmailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
