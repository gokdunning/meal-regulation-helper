import { useState } from "react";
import { ComplianceService } from "@/lib/services/compliance-service";
import { ComplianceDisplay } from "@/components/ComplianceDisplay";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ComplianceResult, ScheduleInput } from "@/types/schedule";

const complianceService = new ComplianceService();

const Index = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ComplianceResult[]>([]);
  const { toast } = useToast();

  const handleCheck = () => {
    try {
      const scheduleInput: ScheduleInput = JSON.parse(input);
      const complianceResults = complianceService.checkCompliance(scheduleInput);
      setResults(complianceResults);
      
      toast({
        title: "Compliance Check Complete",
        description: "The schedule has been analyzed for compliance.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid input format",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Labor Compliance Checker</h1>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Schedule Input (JSON)</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`{
  "state": "CA",
  "shifts": [
    {
      "id": "shift1",
      "employeeId": "emp1",
      "date": "2024-03-20",
      "timeRange": {
        "start": "2024-03-20T09:00:00Z",
        "end": "2024-03-20T17:00:00Z"
      },
      "breaks": [
        {
          "type": "meal",
          "duration": 30,
          "isPaid": false
        }
      ]
    }
  ]
}`}
            className="font-mono min-h-[200px]"
          />
        </div>

        <Button onClick={handleCheck} className="w-full">
          Check Compliance
        </Button>

        {results.length > 0 && <ComplianceDisplay results={results} />}
      </div>
    </div>
  );
};

export default Index;