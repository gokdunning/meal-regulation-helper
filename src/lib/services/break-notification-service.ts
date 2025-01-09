import { toast } from "@/hooks/use-toast";
import { BreakEvent } from "@/types/events";

export class BreakNotificationService {
  private static instance: BreakNotificationService;
  private scheduledNotifications: Map<string, NodeJS.Timeout[]>;

  private constructor() {
    this.scheduledNotifications = new Map();
  }

  static getInstance(): BreakNotificationService {
    if (!this.instance) {
      this.instance = new BreakNotificationService();
    }
    return this.instance;
  }

  scheduleNotification(breakEvent: BreakEvent): void {
    const { employeeId, type, scheduledTime, duration } = breakEvent;
    const notificationTime = new Date(scheduledTime).getTime() - Date.now();

    if (notificationTime > 0) {
      const timeout = setTimeout(() => {
        toast({
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Break Required`,
          description: `${duration} minute ${type} break is now due`,
          duration: 10000,
        });
      }, notificationTime);

      const employeeNotifications = this.scheduledNotifications.get(employeeId) || [];
      employeeNotifications.push(timeout);
      this.scheduledNotifications.set(employeeId, employeeNotifications);
    }
  }

  clearNotifications(employeeId: string): void {
    const notifications = this.scheduledNotifications.get(employeeId);
    if (notifications) {
      notifications.forEach(timeout => clearTimeout(timeout));
      this.scheduledNotifications.delete(employeeId);
    }
  }
}