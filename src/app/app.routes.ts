import { destroyDetachedRouteHandle, Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { StudentExperience } from './pages/student-experience/student-experience';
import { Quiz } from './pages/quiz/quiz';


export const routes: Routes = [
    {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: 'dashboard',
    component: Dashboard
  },

  {
    path: 'student/:id',
    component: StudentExperience
  },

  {
    path: 'quiz/:id',
    component: Quiz
  }
];



