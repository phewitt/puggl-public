import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailListEditComponent } from './email-list-edit.component';

describe('EmailListEditComponent', () => {
  let component: EmailListEditComponent;
  let fixture: ComponentFixture<EmailListEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailListEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailListEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
