import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { StudentPanelResponse } from '../models/student-panel';

@Injectable({
  providedIn: 'root'
})
export class StudentPanelService {
  private apiUrl = `${environment.apiUrl}/api/student`;

  constructor(private http: HttpClient) {}

  getStudentPanel(studentId: string): Observable<StudentPanelResponse> {
    return this.http.get<StudentPanelResponse>(`${this.apiUrl}/${studentId}/dashboard`);
  }
}