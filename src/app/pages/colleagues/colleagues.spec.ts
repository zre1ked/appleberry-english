import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Colleagues } from './colleagues';

describe('Colleagues', () => {
  let component: Colleagues;
  let fixture: ComponentFixture<Colleagues>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Colleagues],
    }).compileComponents();

    fixture = TestBed.createComponent(Colleagues);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
