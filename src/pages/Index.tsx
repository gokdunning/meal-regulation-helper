import { useState } from "react";
import { ComplianceService } from "@/lib/services/compliance-service";
import { ComplianceDisplay } from "@/components/ComplianceDisplay";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ComplianceResult, ScheduleInput } from "@/types/schedule";
import { Alert, AlertDescription } from "@/components/ui/alert";

const complianceService = new ComplianceService();

const defaultInput = {
  state: "CA",
  shifts: [
    {
      id: "shift1",
      employeeId: "emp1",
      date: "2024-03-20",
      timeRange: {
        start: "2024-03-20T09:00:00Z",
        end: "2024-03-20T17:00:00Z"
      }
    },
    {
      id: "shift2",
      employeeId: "emp2",
      date: "2024-03-20",
      timeRange: {
        start: "2024-03-20T08:00:00Z",
        end: "2024-03-20T18:30:00Z"
      }
    },
    {
      id: "shift3",
      employeeId: "emp1",
      date: "2024-03-21",
      timeRange: {
        start: "2024-03-21T11:00:00Z",
        end: "2024-03-21T20:00:00Z"
      }
    },
    {
      id: "shift4",
      employeeId: "emp3",
      date: "2024-03-20",
      timeRange: {
        start: "2024-03-20T07:00:00Z",
        end: "2024-03-20T19:00:00Z"
      }
    }
  ]
};

const Index = () => {
  const [input, setInput] = useState(JSON.stringify(defaultInput, null, 2));
  const [results, setResults] = useState<ComplianceResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCheck = () => {
    setError(null);
    
    if (!input.trim()) {
      setError("Please enter schedule data");
      return;
    }

    try {
      const scheduleInput: ScheduleInput = JSON.parse(input);
      const complianceResults = complianceService.checkCompliance(scheduleInput);
      setResults(complianceResults);
      
      toast({
        title: "Compliance Check Complete",
        description: "The schedule has been analyzed for compliance.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Invalid JSON format. Please check your input.";
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
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
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            className="font-mono min-h-[200px]"
          />
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
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
