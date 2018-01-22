import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailTrackerStatsBoxComponent } from './email-tracker-stats-box.component';

describe('EmailTrackerStatsBoxComponent', () => {
  let component: EmailTrackerStatsBoxComponent;
  let fixture: ComponentFixture<EmailTrackerStatsBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailTrackerStatsBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailTrackerStatsBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
