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
}