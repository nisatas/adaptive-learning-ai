import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Dashboard } from './pages/dashboard/dashboard';
import { StudentExperience } from './pages/student-experience/student-experience';
import { Quiz } from './pages/quiz/quiz';
import { StudentPanel } from './pages/student-panel/student-panel';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'teacher-dashboard',
    component: Dashboard
  },
  {
    path: 'dashboard',
    redirectTo: 'teacher-dashboard',
    pathMatch: 'full'
  },
  {
    path: 'student/:id',
    component: StudentExperience
  },
  {
  path: 'student-panel/:id',
  component: StudentPanel
},
  {
    path: 'quiz/:id',
    component: Quiz
  }
];