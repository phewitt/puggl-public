import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailListCompaniesComponent } from './email-list-companies.component';

describe('EmailListCompaniesComponent', () => {
  let component: EmailListCompaniesComponent;
  let fixture: ComponentFixture<EmailListCompaniesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailListCompaniesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailListCompaniesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
