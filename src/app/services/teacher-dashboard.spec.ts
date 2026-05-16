import { TestBed } from '@angular/core/testing';

import { TeacherDashboard } from './teacher-dashboard';

describe('TeacherDashboard', () => {
  let service: TeacherDashboard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeacherDashboard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
