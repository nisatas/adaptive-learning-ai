import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { DashboardResponse, } from '../../models/dashboard';
import { TeacherDashboardService } from '../../services/teacher-dashboard';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  dashboardData!: DashboardResponse;

  constructor(
    private teacherDashboardService: TeacherDashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.teacherDashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
      },
      error: (error) => {
        console.error('Dashboard verisi alınamadı:', error);
      }
    });
  }

  goToStudentExperience(): void {
    this.router.navigate(['/student', 'stu-1']);
  }
}