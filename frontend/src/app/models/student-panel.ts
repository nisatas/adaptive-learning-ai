export interface StudentNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  lesson: string;
  topic: string;
  duration?: number;
  status: 'read' | 'unread';
}

export interface StudentPanelResponse {
  studentId: string;
  studentName: string;
  notifications: StudentNotification[];
}
