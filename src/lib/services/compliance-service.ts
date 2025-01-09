import { ScheduleInput, ComplianceResult } from "@/types/schedule";
import { CaliforniaRules } from "../rules/california";
import { NewYorkRules } from "../rules/new-york";

export class ComplianceService {
  checkCompliance(input: ScheduleInput): ComplianceResult[] {
    switch (input.state.toLowerCase()) {
      case "ca":
      case "california":
        return input.shifts.map(shift => CaliforniaRules.checkCompliance(shift));
      case "ny":
      case "new york":
        return input.shifts.map(shift => NewYorkRules.checkCompliance(shift));
      default:
        throw new Error(`Rules for state ${input.state} not implemented`);
    }
  }
}