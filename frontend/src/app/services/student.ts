import { Injectable } from '@angular/core';
import { Student } from '../models/student';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private students: Student[] = [
  {
      id: 1,
      name: 'Ayşe Yılmaz',
      supportNeed: 'Odak desteği',
      latestQuizScore: 45,
      status: 'Kişiselleştirilmiş deneyim hazır',
      aiObservation: 'Uzun içeriklerde dikkat kaybı gözlemlendi.'
    },
    {
      id: 2,
      name: 'Mehmet Kaya',
      supportNeed: 'Okuma desteği',
      latestQuizScore: 72,
      status: 'Analiz tamamlandı',
      aiObservation: 'Sadeleştirilmiş içerik ile performans artışı gözlemlendi.'
    },
     {
      id: 3,
      name: 'Zeynep Arslan',
      supportNeed: 'Standart deneyim',
      latestQuizScore: 88,
      status: 'Stabil öğrenme deneyimi',
      aiObservation: 'Öğrenme akışı stabil ilerliyor.'
    }
  ];
    getStudents(): Student[] {
    return this.students;
  }

  getStudentById(id: number): Student | undefined {
    return this.students.find(student => student.id === id);
  }

}
