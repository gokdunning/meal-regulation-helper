import { differenceInHours, addHours, parseISO } from "date-fns";
import { CaliforniaRules } from "../rules/california";
import { NewYorkRules } from "../rules/new-york";
import { BreakNotificationService } from "./break-notification-service";
import { ClockInEvent, EmployeeShiftStatus, BreakEvent } from "@/types/events";
import { toast } from "@/hooks/use-toast";

export class EmployeeBreakService {
  private static instance: EmployeeBreakService;
  private activeShifts: Map<string, EmployeeShiftStatus>;
  private notificationService: BreakNotificationService;
  private subscribers: ((status: EmployeeShiftStatus[]) => void)[];

  private constructor() {
    this.activeShifts = new Map();
    this.notificationService = BreakNotificationService.getInstance();
    this.subscribers = [];
  }

  static getInstance(): EmployeeBreakService {
    if (!this.instance) {
      this.instance = new EmployeeBreakService();
    }
    return this.instance;
  }

  subscribe(callback: (status: EmployeeShiftStatus[]) => void): () => void {
    this.subscribers.push(callback);
    callback(Array.from(this.activeShifts.values()));
    
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(): void {
    const statuses = Array.from(this.activeShifts.values());
    this.subscribers.forEach(callback => callback(statuses));
  }

  handleClockIn(event: ClockInEvent): EmployeeShiftStatus {
    const rules = this.getRulesForState(event.state);
    const shift = {
      id: `${event.employeeId}-${Date.now()}`,
      employeeId: event.employeeId,
      date: event.timestamp.split('T')[0],
      timeRange: {
        start: event.timestamp,
        end: addHours(parseISO(event.timestamp), 8).toISOString()
      }
    };

    const complianceResult = rules.checkCompliance(shift);
    
    // Convert compliance recommendations into break events
    const requiredBreaks = this.generateBreakEvents(event.employeeId, event.timestamp, complianceResult.recommendations);

    const shiftStatus: EmployeeShiftStatus = {
      employeeId: event.employeeId,
      clockInTime: event.timestamp,
      requiredBreaks,
      completedBreaks: [],
      state: event.state
    };

    // Store shift status
    this.activeShifts.set(event.employeeId, shiftStatus);

    // Schedule notifications for each break
    requiredBreaks.forEach(breakEvent => {
      this.notificationService.scheduleNotification(breakEvent);
    });

    // Show immediate toast with break schedule
    this.showBreakScheduleToast(requiredBreaks);

    // Notify subscribers of the update
    this.notifySubscribers();

    return shiftStatus;
  }

  handleClockOut(employeeId: string): void {
    this.notificationService.clearNotifications(employeeId);
    this.activeShifts.delete(employeeId);
    this.notifySubscribers();
  }

  getActiveShifts(): EmployeeShiftStatus[] {
    return Array.from(this.activeShifts.values());
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

  private generateBreakEvents(employeeId: string, startTime: string, recommendations: string[]): BreakEvent[] {
    const breaks: BreakEvent[] = [];
    const start = parseISO(startTime);

    recommendations.forEach((rec, index) => {
      const isMeal = rec.toLowerCase().includes('meal');
      const scheduledTime = addHours(start, (index + 1) * 2).toISOString();
      
      breaks.push({
        employeeId,
        type: isMeal ? 'meal' : 'rest',
        scheduledTime,
        duration: isMeal ? 30 : 10,
        isPaid: !isMeal
      });
    });

    return breaks;
  }

  private showBreakScheduleToast(breaks: BreakEvent[]): void {
    const breakSchedule = breaks
      .map(b => `${b.type} break at ${new Date(b.scheduledTime).toLocaleTimeString()}`)
      .join('\n');
    
    toast({
      title: "Your Break Schedule",
      description: breakSchedule,
      duration: 10000,
    });
  }
}