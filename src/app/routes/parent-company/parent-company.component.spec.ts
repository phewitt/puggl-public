import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentCompanyComponent } from './parent-company.component';

describe('ParentCompanyComponent', () => {
  let component: ParentCompanyComponent;
  let fixture: ComponentFixture<ParentCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParentCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
