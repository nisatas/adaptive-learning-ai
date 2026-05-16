import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class QuizService {

  private apiUrl = `${environment.apiUrl}/api/quizzes`;

  constructor(private http: HttpClient) {}

  getDemoQuiz(): Observable<any> {
    return this.http.get(`${this.apiUrl}/demo`);
  }

  submitQuiz(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/demo/submit`, payload);
  }
}