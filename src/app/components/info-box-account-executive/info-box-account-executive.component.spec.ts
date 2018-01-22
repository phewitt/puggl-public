import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoBoxAccountExecutiveComponent } from './info-box-account-executive.component';

describe('InfoBoxAccountExecutiveComponent', () => {
  let component: InfoBoxAccountExecutiveComponent;
  let fixture: ComponentFixture<InfoBoxAccountExecutiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoBoxAccountExecutiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoBoxAccountExecutiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
