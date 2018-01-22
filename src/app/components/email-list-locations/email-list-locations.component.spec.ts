import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailListLocationsComponent } from './email-list-locations.component';

describe('EmailListLocationsComponent', () => {
  let component: EmailListLocationsComponent;
  let fixture: ComponentFixture<EmailListLocationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailListLocationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailListLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
