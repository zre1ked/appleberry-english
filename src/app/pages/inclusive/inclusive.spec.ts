import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Inclusive } from './inclusive';

describe('Inclusive', () => {
  let component: Inclusive;
  let fixture: ComponentFixture<Inclusive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Inclusive],
    }).compileComponents();

    fixture = TestBed.createComponent(Inclusive);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
