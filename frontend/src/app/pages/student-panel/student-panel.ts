import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';



@Component({
  selector: 'app-student-panel',
  imports: [CommonModule],
  templateUrl: './student-panel.html',
  styleUrl: './student-panel.css',
})
export class StudentPanel {
  activeSection: 'home' | 'dashboard' | 'lessons' = 'home';

  constructor(private router: Router) {}

  changeSection(section: 'home' | 'dashboard' | 'lessons'): void {
    this.activeSection = section;
  }

  goToTeacherDashboard(): void {
    this.router.navigate(['/teacher-dashboard']);
  }
  lessonsOpen = false;
turkishOpen = false;

toggleLessons(): void {
  this.lessonsOpen = !this.lessonsOpen;
}

toggleTurkish(): void {
  this.turkishOpen = !this.turkishOpen;
}

  goToLesson(): void {
    this.router.navigate(['/student', 'stu-1']);
  }
}
