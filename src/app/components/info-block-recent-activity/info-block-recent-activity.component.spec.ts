import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoBlockRecentActivityComponent } from './info-block-recent-activity.component';

describe('InfoBlockRecentActivityComponent', () => {
  let component: InfoBlockRecentActivityComponent;
  let fixture: ComponentFixture<InfoBlockRecentActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoBlockRecentActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoBlockRecentActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
