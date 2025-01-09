import { Break, Shift, ComplianceResult, ComplianceIssue } from "@/types/schedule";
import { differenceInHours, differenceInMinutes, parseISO } from "date-fns";

export class NewYorkRules {
  private static MEAL_BREAK_THRESHOLD = 6; // hours (NY requires meal break after 6 hours)
  private static REST_BREAK_INTERVAL = 4; // hours
  private static MEAL_BREAK_DURATION = 30; // minutes
  private static REST_BREAK_DURATION = 15; // minutes (NY has longer rest breaks)

  static checkCompliance(shift: Shift): ComplianceResult {
    const issues: ComplianceIssue[] = [];
    const recommendations: string[] = [];
    const requiredBreaks: Break[] = [];
    
    const shiftDuration = differenceInHours(
      parseISO(shift.timeRange.end),
      parseISO(shift.timeRange.start)
    );

    // Calculate required meal breaks (NY rules)
    if (shiftDuration > this.MEAL_BREAK_THRESHOLD) {
      requiredBreaks.push({
        type: "meal",
        duration: this.MEAL_BREAK_DURATION,
        isPaid: false
      });
      
      recommendations.push(
        `Schedule one unpaid meal break of ${this.MEAL_BREAK_DURATION} minutes`
      );
      
      issues.push({
        type: "warning",
        message: "Shift requires a meal break",
        regulation: "NY Meal Break Requirement",
        shiftId: `${shift.employeeId}-${shift.id}`
      });
    }

    // Calculate required rest breaks
    const requiredRestBreaks = Math.floor(shiftDuration / this.REST_BREAK_INTERVAL);
    if (requiredRestBreaks > 0) {
      recommendations.push(
        `Schedule ${requiredRestBreaks} paid rest break(s) of ${this.REST_BREAK_DURATION} minutes each`
      );
      
      issues.push({
        type: "warning",
        message: `Shift requires ${requiredRestBreaks} rest break(s)`,
        regulation: "NY Rest Break Requirement",
        shiftId: `${shift.employeeId}-${shift.id}`
      });
    }

    return {
      isCompliant: true, // Since we're just providing recommendations
      issues,
      recommendations,
      shiftId: `${shift.employeeId}-${shift.id}`
    };
  }
}