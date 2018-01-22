import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarFormDealComponent } from './sidebar-form-deal.component';

describe('SidebarFormDealComponent', () => {
  let component: SidebarFormDealComponent;
  let fixture: ComponentFixture<SidebarFormDealComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarFormDealComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarFormDealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
