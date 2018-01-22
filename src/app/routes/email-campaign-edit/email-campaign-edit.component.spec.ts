import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailCampaignEditComponent } from './email-campaign-edit.component';

describe('EmailCampaignEditComponent', () => {
  let component: EmailCampaignEditComponent;
  let fixture: ComponentFixture<EmailCampaignEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailCampaignEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailCampaignEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
