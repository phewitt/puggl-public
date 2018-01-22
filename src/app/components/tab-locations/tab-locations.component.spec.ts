import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabLocationsComponent } from './tab-locations.component';

describe('TabLocationsComponent', () => {
  let component: TabLocationsComponent;
  let fixture: ComponentFixture<TabLocationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabLocationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
