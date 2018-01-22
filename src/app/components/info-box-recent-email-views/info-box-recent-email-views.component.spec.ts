import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoBoxRecentEmailViewsComponent } from './info-box-recent-email-views.component';

describe('InfoBoxRecentEmailViewsComponent', () => {
  let component: InfoBoxRecentEmailViewsComponent;
  let fixture: ComponentFixture<InfoBoxRecentEmailViewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoBoxRecentEmailViewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoBoxRecentEmailViewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
