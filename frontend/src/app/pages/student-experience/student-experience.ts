import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-student-experience',
  imports: [CommonModule],
  templateUrl: './student-experience.html',
  styleUrl: './student-experience.css',
})
export class StudentExperience implements OnInit {
  personalizedMode = false;

  uiSettings = {
    largerText: false,
    showHints: false,
    stepByStepMode: false,
    reduceDistractions: false,
    showProgressFocus: false,
    showChallengeQuestions: false,
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.personalizedMode = params['personalized'] === 'true';

      if (this.personalizedMode) {
        const savedSettings = localStorage.getItem('adaptiveUiSettings');

        if (savedSettings) {
          this.uiSettings = JSON.parse(savedSettings);
        }
      } else {
        this.resetUiSettings();
      }
    });
  }

  resetUiSettings(): void {
    this.uiSettings = {
      largerText: false,
      showHints: false,
      stepByStepMode: false,
      reduceDistractions: false,
      showProgressFocus: false,
      showChallengeQuestions: false,
    };
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  startQuiz(): void {
    localStorage.removeItem('adaptiveUiSettings');
    this.router.navigate(['/quiz', 'stu-1']);
  }
}
