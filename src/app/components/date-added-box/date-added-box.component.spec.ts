import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateAddedBoxComponent } from './date-added-box.component';

describe('DateAddedBoxComponent', () => {
  let component: DateAddedBoxComponent;
  let fixture: ComponentFixture<DateAddedBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateAddedBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateAddedBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
