import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailCampaignsComponent } from './email-campaigns.component';

describe('EmailCampaignsComponent', () => {
  let component: EmailCampaignsComponent;
  let fixture: ComponentFixture<EmailCampaignsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailCampaignsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailCampaignsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
