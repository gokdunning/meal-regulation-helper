import { differenceInHours, addHours, parseISO } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { CaliforniaRules } from "../rules/california";
import { NewYorkRules } from "../rules/new-york";
import { Shift, Break, ComplianceResult } from "@/types/schedule";

export class EmployeeBreakService {
  private static instance: EmployeeBreakService;
  private scheduledNotifications: Map<string, NodeJS.Timeout[]>;

  private constructor() {
    this.scheduledNotifications = new Map();
  }

  static getInstance(): EmployeeBreakService {
    if (!this.instance) {
      this.instance = new EmployeeBreakService();
    }
    return this.instance;
  }

  handleClockIn(employeeId: string, state: string, clockInTime: string): ComplianceResult {
    // Clear any existing notifications for this employee
    this.clearScheduledNotifications(employeeId);

    // Create a shift object starting from clock-in time
    const shift: Shift = {
      id: `shift-${Date.now()}`,
      employeeId,
      date: clockInTime.split('T')[0],
      timeRange: {
        start: clockInTime,
        end: addHours(parseISO(clockInTime), 8).toISOString() // Assume 8-hour shift
      }
    };

    // Get compliance rules based on state
    const rules = this.getRulesForState(state);
    const complianceResult = rules.checkCompliance(shift);

    // Schedule notifications for each required break
    this.scheduleBreakNotifications(employeeId, shift, complianceResult);

    // Show immediate toast with break schedule
    this.showBreakScheduleToast(complianceResult);

    return complianceResult;
  }

  private getRulesForState(state: string) {
    switch (state.toLowerCase()) {
      case "ca":
      case "california":
        return CaliforniaRules;
      case "ny":
      case "new york":
        return NewYorkRules;
      default:
        throw new Error(`Rules for state ${state} not implemented`);
    }
  }

  private scheduleBreakNotifications(
    employeeId: string,
    shift: Shift,
    complianceResult: ComplianceResult
  ) {
    const notifications: NodeJS.Timeout[] = [];
    const startTime = parseISO(shift.timeRange.start);

    // Schedule notifications for each recommendation
    complianceResult.recommendations.forEach((recommendation, index) => {
      // Calculate when to send notification (this is a simple example - you'd want more sophisticated timing)
      const notificationTime = addHours(startTime, (index + 1) * 2);
      const timeUntilNotification = notificationTime.getTime() - Date.now();

      if (timeUntilNotification > 0) {
        const timeout = setTimeout(() => {
          toast({
            title: "Break Reminder",
            description: recommendation,
          });
        }, timeUntilNotification);

        notifications.push(timeout);
      }
    });

    this.scheduledNotifications.set(employeeId, notifications);
  }

  private clearScheduledNotifications(employeeId: string) {
    const existingNotifications = this.scheduledNotifications.get(employeeId);
    if (existingNotifications) {
      existingNotifications.forEach(timeout => clearTimeout(timeout));
      this.scheduledNotifications.delete(employeeId);
    }
  }

  private showBreakScheduleToast(complianceResult: ComplianceResult) {
    const breakSchedule = complianceResult.recommendations.join('\n');
    toast({
      title: "Your Break Schedule",
      description: breakSchedule,
      duration: 10000, // Show for 10 seconds
    });
  }

  // Call this when employee clocks out
  handleClockOut(employeeId: string) {
    this.clearScheduledNotifications(employeeId);
  }
}