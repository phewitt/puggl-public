import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailListParentCompaniesComponent } from './email-list-parent-companies.component';

describe('EmailListParentCompaniesComponent', () => {
  let component: EmailListParentCompaniesComponent;
  let fixture: ComponentFixture<EmailListParentCompaniesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailListParentCompaniesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailListParentCompaniesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
