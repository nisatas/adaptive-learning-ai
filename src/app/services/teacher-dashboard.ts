import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { DashboardResponse } from '../models/dashboard';

@Injectable({
  providedIn: 'root'
})
export class TeacherDashboardService {

  private apiUrl = `${environment.apiUrl}/api/teacher/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.apiUrl);
  }
}