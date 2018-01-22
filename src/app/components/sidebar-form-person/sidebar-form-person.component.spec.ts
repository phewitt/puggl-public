import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarFormPersonComponent } from './sidebar-form-person.component';

describe('SidebarFormPersonComponent', () => {
  let component: SidebarFormPersonComponent;
  let fixture: ComponentFixture<SidebarFormPersonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarFormPersonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarFormPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
