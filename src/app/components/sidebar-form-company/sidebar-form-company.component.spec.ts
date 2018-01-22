import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarFormCompanyComponent } from './sidebar-form-company.component';

describe('SidebarFormCompanyComponent', () => {
  let component: SidebarFormCompanyComponent;
  let fixture: ComponentFixture<SidebarFormCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarFormCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarFormCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
