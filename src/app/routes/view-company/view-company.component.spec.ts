import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCompanyComponent } from './view-company.component';

describe('ViewCompanyComponent', () => {
  let component: ViewCompanyComponent;
  let fixture: ComponentFixture<ViewCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
