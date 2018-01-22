import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoBoxDealsComponent } from './info-box-deals.component';

describe('InfoBoxDealsComponent', () => {
  let component: InfoBoxDealsComponent;
  let fixture: ComponentFixture<InfoBoxDealsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoBoxDealsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoBoxDealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
