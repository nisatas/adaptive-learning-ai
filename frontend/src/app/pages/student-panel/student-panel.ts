import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  StudentNotification,
  StudentPanelResponse
} from '../../models/student-panel';

import { StudentPanelService } from '../../services/student-panel';

@Component({
  selector: 'app-student-panel',
  imports: [CommonModule],
  templateUrl: './student-panel.html',
  styleUrl: './student-panel.css'
})
export class StudentPanel implements OnInit {
  activeSection: 'home' | 'dashboard' | 'lessons' = 'home';

  lessonsOpen = false;
  turkishOpen = false;
  notificationsOpen = false;

  studentPanelData?: StudentPanelResponse;
  notifications: StudentNotification[] = [];

  constructor(
    private router: Router,
    private studentPanelService: StudentPanelService
  ) {}

  ngOnInit(): void {
    this.studentPanelService.getStudentPanel('stu-1').subscribe({
      next: (data) => {
        this.studentPanelData = data;
        this.notifications = data.notifications;
      },
      error: (error) => {
        console.error('Student panel verisi alınamadı:', error);
      }
    });
  }

  changeSection(section: 'home' | 'dashboard' | 'lessons'): void {
    this.activeSection = section;
  }

  toggleLessons(): void {
    this.lessonsOpen = !this.lessonsOpen;
  }

  toggleTurkish(): void {
    this.turkishOpen = !this.turkishOpen;
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
  }

  goToTeacherDashboard(): void {
    this.router.navigate(['/teacher-dashboard']);
  }

  goToLesson(): void {
    this.router.navigate(['/student', 'stu-1']);
  }
}