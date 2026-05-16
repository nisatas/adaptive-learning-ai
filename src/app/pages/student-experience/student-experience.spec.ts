import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentExperience } from './student-experience';

describe('StudentExperience', () => {
  let component: StudentExperience;
  let fixture: ComponentFixture<StudentExperience>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentExperience],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentExperience);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
