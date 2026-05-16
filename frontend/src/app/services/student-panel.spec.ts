import { TestBed } from '@angular/core/testing';

import { StudentPanel } from './student-panel';

describe('StudentPanel', () => {
  let service: StudentPanel;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentPanel);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
