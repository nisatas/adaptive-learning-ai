import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { QuizService } from '../../services/quiz';

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  questionId: string;
  questionText: string;
  topic: string;
  options: QuizOption[];
  difficulty: string;
}

interface QuizResponse {
  quizId: string;
  lesson: string;
  gradeLevel: number;
  topic: string;
  totalQuestions: number;
  questions: QuizQuestion[];
}

@Component({
  selector: 'app-quiz',
  imports: [CommonModule],
  templateUrl: './quiz.html',
  styleUrl: './quiz.css'
})
export class Quiz implements OnInit {
  quizData!: QuizResponse;
  questions: QuizQuestion[] = [];

  currentQuestionIndex = 0;
  selectedOptionId = '';
  isLoading = true;

  answers: {
    questionId: string;
    selectedOptionId: string;
    timeSpentSeconds: number;
    skipped: boolean;
  }[] = [];

  constructor(
    private quizService: QuizService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.quizService.getDemoQuiz().subscribe({
      next: (data) => {
        this.quizData = data;
        this.questions = data.questions;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Quiz soruları alınamadı:', error);
        this.isLoading = false;
      }
    });
  }

  get currentQuestion(): QuizQuestion {
    return this.questions[this.currentQuestionIndex];
  }

  selectOption(optionId: string): void {
    this.selectedOptionId = optionId;
  }

  nextQuestion(): void {
    this.answers.push({
      questionId: this.currentQuestion.questionId,
      selectedOptionId: this.selectedOptionId,
      timeSpentSeconds: 18,
      skipped: !this.selectedOptionId
    });

    this.selectedOptionId = '';

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz(): void {
  const payload = {
    studentId: 'stu-1',
    answers: this.answers
  };

  this.quizService.submitQuiz(payload).subscribe({
    next: (response) => {
      console.log('Quiz submit response:', response);

      localStorage.setItem('adaptiveUiSettings', JSON.stringify(response.uiSettings));

      this.router.navigate(['/student', 'stu-1'], {
        queryParams: {
          personalized: true
        }
      });
    },
    error: (error) => {
      console.error('Quiz sonucu gönderilemedi:', error);

      const fallbackUiSettings = {
        largerText: true,
        showHints: true,
        stepByStepMode: false,
        reduceDistractions: false,
        showProgressFocus: false,
        showChallengeQuestions: false
      };

      localStorage.setItem('adaptiveUiSettings', JSON.stringify(fallbackUiSettings));

      this.router.navigate(['/student', 'stu-1'], {
        queryParams: {
          personalized: true
        }
      });
    }
  });
}
}