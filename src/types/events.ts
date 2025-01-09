export interface BreakEvent {
  employeeId: string;
  type: 'meal' | 'rest';
  scheduledTime: string;
  duration: number;
  isPaid: boolean;
}

export interface ClockInEvent {
  employeeId: string;
  timestamp: string;
  state: string;
}

export interface EmployeeShiftStatus {
  employeeId: string;
  clockInTime: string;
  requiredBreaks: BreakEvent[];
  completedBreaks: BreakEvent[];
  state: string;
}