export interface TimeRange {
  start: string; // ISO string
  end: string; // ISO string
}

export interface Break {
  type: "meal" | "rest";
  duration: number; // in minutes
  isPaid: boolean;
  waived?: boolean;
}

export interface Shift {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  timeRange: TimeRange;
  breaks: Break[];
}

export interface ScheduleInput {
  state: string;
  shifts: Shift[];
}

export interface ComplianceIssue {
  type: "error" | "warning";
  message: string;
  regulation: string;
  shiftId: string;
}

export interface ComplianceResult {
  isCompliant: boolean;
  issues: ComplianceIssue[];
  recommendations: string[];
}