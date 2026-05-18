import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { QuizSubmitRequest, QuizSubmitResponse } from '../models/quiz-submit';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private apiUrl = `${environment.apiUrl}/api/quizzes`;

  constructor(private http: HttpClient) {}

  getDemoQuiz(): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/demo`);
  }

  submitQuiz(payload: QuizSubmitRequest): Observable<QuizSubmitResponse> {
    return this.http.post<QuizSubmitResponse>(
      `${this.apiUrl}/demo/submit`,
      payload,
    );
  }
}