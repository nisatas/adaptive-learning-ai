import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentPanel } from './student-panel';

describe('StudentPanel', () => {
  let component: StudentPanel;
  let fixture: ComponentFixture<StudentPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
