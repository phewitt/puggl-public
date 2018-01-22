import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabCompanyComponent } from './tab-company.component';

describe('TabCompanyComponent', () => {
  let component: TabCompanyComponent;
  let fixture: ComponentFixture<TabCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
