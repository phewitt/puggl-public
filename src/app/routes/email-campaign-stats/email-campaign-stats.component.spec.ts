import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailCampaignStatsComponent } from './email-campaign-stats.component';

describe('EmailCampaignStatsComponent', () => {
  let component: EmailCampaignStatsComponent;
  let fixture: ComponentFixture<EmailCampaignStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailCampaignStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailCampaignStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
