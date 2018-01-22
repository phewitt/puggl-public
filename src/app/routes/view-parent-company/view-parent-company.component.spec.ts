import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewParentCompanyComponent } from './view-parent-company.component';

describe('ViewParentCompanyComponent', () => {
  let component: ViewParentCompanyComponent;
  let fixture: ComponentFixture<ViewParentCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewParentCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewParentCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
