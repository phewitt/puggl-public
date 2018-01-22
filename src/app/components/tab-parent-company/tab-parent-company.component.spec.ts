import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabParentCompanyComponent } from './tab-parent-company.component';

describe('TabParentCompanyComponent', () => {
  let component: TabParentCompanyComponent;
  let fixture: ComponentFixture<TabParentCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabParentCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabParentCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
