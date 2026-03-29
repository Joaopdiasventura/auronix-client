export interface DashboardMetric {
  helper: string;
  label: string;
  tone: 'neutral' | 'positive' | 'negative' | 'info';
  value: string;
}

export interface DashboardChartPoint {
  direction: 'in' | 'out';
  id: string;
  label: string;
  shortLabel: string;
  value: number;
  valueLabel: string;
}

export interface PageFeedbackState {
  description: string;
  title: string;
  tone: 'neutral' | 'danger' | 'info' | 'success';
}

export interface TimelineStep {
  description: string;
  isCurrent: boolean;
  label: string;
  timestampLabel: string;
  tone: 'neutral' | 'danger' | 'info' | 'success';
}
