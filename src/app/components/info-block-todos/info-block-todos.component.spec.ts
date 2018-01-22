import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoBlockTodosComponent } from './info-block-todos.component';

describe('InfoBlockTodosComponent', () => {
  let component: InfoBlockTodosComponent;
  let fixture: ComponentFixture<InfoBlockTodosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoBlockTodosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoBlockTodosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
