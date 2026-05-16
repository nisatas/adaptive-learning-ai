import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkflowService } from '../../services/workflow';

import { DashboardResponse,  DashboardStudent } from '../../models/dashboard';
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
  private workflowService: WorkflowService,
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
    this.router.navigate(['/student-panel', 'stu-1']);
  }
  scrollToSection(sectionId: string): void {
  const element = document.getElementById(sectionId);

  if (element) {
    element.scrollIntoView({
      behavior: 'smooth'
    });
  }
}
  planMeet(student: DashboardStudent): void {
  const payload = {
    workflowType: 'student_meet_request',
    teacherName: this.dashboardData.teacherName,
    teacherEmail: 'teacher@example.com',
    studentName: student.name,
    studentEmail: student.email,
    lesson: student.lesson,
    topic: student.topic,
    reason: student.reason,
    suggestedDuration: student.suggestedDuration,
    priority: student.priority
  };

  this.workflowService.triggerWorkflow(payload).subscribe({
    next: (response) => {
      console.log('Meet workflow response:', response);
      alert('Meet planlama isteği oluşturuldu.');
    },
    error: (error) => {
      console.error('Meet workflow hatası:', error);
      alert('Meet planlama isteği şu an oluşturulamadı.');
    }
  });
}
}