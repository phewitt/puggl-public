import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarFormParentCompanyComponent } from './sidebar-form-parent-company.component';

describe('SidebarFormParentCompanyComponent', () => {
  let component: SidebarFormParentCompanyComponent;
  let fixture: ComponentFixture<SidebarFormParentCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarFormParentCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarFormParentCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
