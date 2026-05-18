import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Dashboard } from './pages/dashboard/dashboard';
import { Quiz } from './pages/quiz/quiz';
import { StudentPanel } from './pages/student-panel/student-panel';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'teacher-dashboard',
    component: Dashboard,
  },
  {
    path: 'dashboard',
    redirectTo: 'teacher-dashboard',
    pathMatch: 'full',
  },
  {
    path: 'student-panel/:id',
    component: StudentPanel,
  },
  {
    path: 'student-panel/:id/quiz/:topicId',
    component: Quiz,
  },
  {
    path: 'student/:id',
    redirectTo: (route) => {
      const id = route.params['id'] ?? 'stu-1';
      return `/student-panel/${id}`;
    },
  },
  {
    path: 'quiz/:id',
    redirectTo: (route) => {
      const id = route.params['id'] ?? 'stu-1';
      return `/student-panel/${id}/quiz/paragrafta-anlam`;
    },
  },
];
