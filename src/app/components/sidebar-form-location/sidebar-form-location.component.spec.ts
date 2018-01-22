import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarFormLocationComponent } from './sidebar-form-location.component';

describe('SidebarFormLocationComponent', () => {
  let component: SidebarFormLocationComponent;
  let fixture: ComponentFixture<SidebarFormLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarFormLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarFormLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
