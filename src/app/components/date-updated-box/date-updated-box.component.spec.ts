import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateUpdatedBoxComponent } from './date-updated-box.component';

describe('DateUpdatedBoxComponent', () => {
  let component: DateUpdatedBoxComponent;
  let fixture: ComponentFixture<DateUpdatedBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateUpdatedBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateUpdatedBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
