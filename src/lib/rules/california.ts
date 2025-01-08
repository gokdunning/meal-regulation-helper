import { Break, Shift, ComplianceResult, ComplianceIssue } from "@/types/schedule";
import { differenceInHours, differenceInMinutes, parseISO } from "date-fns";

export class CaliforniaRules {
  private static MEAL_BREAK_THRESHOLD = 5; // hours
  private static SECOND_MEAL_BREAK_THRESHOLD = 10; // hours
  private static REST_BREAK_INTERVAL = 4; // hours
  private static MEAL_BREAK_DURATION = 30; // minutes
  private static REST_BREAK_DURATION = 10; // minutes

  static checkCompliance(shift: Shift): ComplianceResult {
    const issues: ComplianceIssue[] = [];
    const recommendations: string[] = [];
    const requiredBreaks: Break[] = [];
    
    const shiftDuration = differenceInHours(
      parseISO(shift.timeRange.end),
      parseISO(shift.timeRange.start)
    );

    // Calculate required meal breaks
    const requiredMealBreaks = this.getRequiredMealBreaks(shiftDuration);
    for (let i = 0; i < requiredMealBreaks; i++) {
      requiredBreaks.push({
        type: "meal",
        duration: this.MEAL_BREAK_DURATION,
        isPaid: false
      });
    }

    // Calculate required rest breaks
    const requiredRestBreaks = Math.floor(shiftDuration / this.REST_BREAK_INTERVAL);
    for (let i = 0; i < requiredRestBreaks; i++) {
      requiredBreaks.push({
        type: "rest",
        duration: this.REST_BREAK_DURATION,
        isPaid: true
      });
    }

    // Generate recommendations and issues
    if (requiredMealBreaks > 0) {
      recommendations.push(
        `Schedule ${requiredMealBreaks} unpaid meal break(s) of ${this.MEAL_BREAK_DURATION} minutes each`
      );
      issues.push({
        type: "warning",
        message: `Shift requires ${requiredMealBreaks} meal break(s)`,
        regulation: "CA Meal Break Requirement",
        shiftId: shift.id
      });
    }

    if (requiredRestBreaks > 0) {
      recommendations.push(
        `Schedule ${requiredRestBreaks} paid rest break(s) of ${this.REST_BREAK_DURATION} minutes each`
      );
      issues.push({
        type: "warning",
        message: `Shift requires ${requiredRestBreaks} rest break(s)`,
        regulation: "CA Rest Break Requirement",
        shiftId: shift.id
      });
    }

    return {
      isCompliant: true, // Since we're just providing recommendations
      issues,
      recommendations
    };
  }

  private static getRequiredMealBreaks(hours: number): number {
    if (hours <= this.MEAL_BREAK_THRESHOLD) return 0;
    if (hours <= this.SECOND_MEAL_BREAK_THRESHOLD) return 1;
    return 2;
  }
}