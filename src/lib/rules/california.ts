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
    
    const shiftDuration = differenceInHours(
      parseISO(shift.timeRange.end),
      parseISO(shift.timeRange.start)
    );

    // Check meal breaks
    const requiredMealBreaks = this.getRequiredMealBreaks(shiftDuration);
    const actualMealBreaks = shift.breaks.filter(b => b.type === "meal");
    
    if (actualMealBreaks.length < requiredMealBreaks) {
      issues.push({
        type: "error",
        message: `Missing required meal break(s). Need ${requiredMealBreaks}, found ${actualMealBreaks.length}`,
        regulation: "CA Meal Break Requirement",
        shiftId: shift.id
      });
    }

    // Check rest breaks
    const requiredRestBreaks = Math.floor(shiftDuration / this.REST_BREAK_INTERVAL);
    const actualRestBreaks = shift.breaks.filter(b => b.type === "rest");
    
    if (actualRestBreaks.length < requiredRestBreaks) {
      issues.push({
        type: "error",
        message: `Missing required rest break(s). Need ${requiredRestBreaks}, found ${actualRestBreaks.length}`,
        regulation: "CA Rest Break Requirement",
        shiftId: shift.id
      });
    }

    // Check break durations
    actualMealBreaks.forEach(break_ => {
      if (break_.duration < this.MEAL_BREAK_DURATION) {
        issues.push({
          type: "error",
          message: "Meal break duration less than required 30 minutes",
          regulation: "CA Meal Break Duration",
          shiftId: shift.id
        });
      }
    });

    actualRestBreaks.forEach(break_ => {
      if (break_.duration < this.REST_BREAK_DURATION) {
        issues.push({
          type: "error",
          message: "Rest break duration less than required 10 minutes",
          regulation: "CA Rest Break Duration",
          shiftId: shift.id
        });
      }
    });

    // Add recommendations
    if (issues.length > 0) {
      recommendations.push(
        `Schedule ${requiredMealBreaks} meal break(s) of 30 minutes each`,
        `Schedule ${requiredRestBreaks} rest break(s) of 10 minutes each`
      );
    }

    return {
      isCompliant: issues.length === 0,
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