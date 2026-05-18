export interface RecommendedAction {
  text: string;
}

export interface SupportDistributionItem {
  label: string;
  count: number;
  percentage: number;
}

export interface PuqAiAgentFeedItem {
  id: string;
  type: string;
  title: string;
  message: string;
  source: string;
  createdAt: string;
}

export interface FrontendHints {
  recommendedActionsTarget: string;
  supportDistributionTarget: string;
  agentFeedTarget: string;
  settingsStatus: string;
}

export interface StudentNeedingSupport {
  studentId: string;
  studentName: string;
  lesson: string;
  topic: string;
  reason: string;
  suggestedAction: string;
  priority: 'low' | 'medium' | 'high';
}

export interface DashboardResponse {
  className: string;
  lesson: string;
  topic: string;
  studentCount: number;
  classAverage: number;
  averageResponseTime: number;
  supportSuggestedCount: number;
  challengeReadyCount: number;
  mostDifficultTopic: string;
  lastUpdated: string;
  teacherName: string;
  teacherRole: string;
  recommendedActions: string[];
  supportDistribution: SupportDistributionItem[];
  puqAiAgentFeed: PuqAiAgentFeedItem[];
  frontendHints: FrontendHints;
  studentsNeedingSupport?: StudentNeedingSupport[];
  students: DashboardStudent[];
  weeklyReport: WeeklyReport;
}
export interface DashboardStudent {
  id: string;
  name: string;
  email: string;
  lesson: string;
  topic: string;
  reason: string;
  suggestedDuration: number;
  priority: 'low' | 'medium' | 'high';
}
export interface WeeklyReport {
  workflowType: string;
  classSummary: string;
  progressTrend: string;
  mostDifficultTopic: string;
  keyFindings: string[];
  studentsNeedingSupportSummary: string[];
  recommendedTeacherActions: string[];
  nextWeekFocus: string[];
}