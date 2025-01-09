import { ComplianceResult } from "@/types/schedule";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface ComplianceDisplayProps {
  results: ComplianceResult[];
}

export const ComplianceDisplay = ({ results }: ComplianceDisplayProps) => {
  const allCompliant = results.every(result => result.isCompliant);
  
  // Group results by employeeId
  const groupedResults = results.reduce((acc, result) => {
    const employeeId = result.shiftId.split('-')[0] || 'unknown';
    if (!acc[employeeId]) {
      acc[employeeId] = [];
    }
    acc[employeeId].push(result);
    return acc;
  }, {} as Record<string, ComplianceResult[]>);

  return (
    <div className="space-y-6 animate-slideIn">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-2xl font-semibold">Compliance Status</h2>
        {allCompliant ? (
          <Badge className="bg-success">Compliant</Badge>
        ) : (
          <Badge className="bg-error">Non-Compliant</Badge>
        )}
      </div>

      {Object.entries(groupedResults).map(([employeeId, employeeResults]) => (
        <div key={employeeId} className="space-y-4">
          <h3 className="text-xl font-medium">Employee {employeeId}</h3>
          
          {employeeResults.map((result, index) => (
            <Card key={index} className="p-6 space-y-4">
              {result.issues.map((issue, issueIndex) => (
                <Alert
                  key={issueIndex}
                  variant={issue.type === "error" ? "destructive" : "default"}
                  className="animate-slideIn"
                >
                  {issue.type === "error" ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle>{issue.regulation}</AlertTitle>
                  <AlertDescription>{issue.message}</AlertDescription>
                </Alert>
              ))}

              {result.recommendations.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-medium">Recommendations:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.recommendations.map((rec, recIndex) => (
                      <li key={recIndex} className="text-sm text-muted-foreground">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.isCompliant && result.issues.length === 0 && (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  <span>All compliance requirements met</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
};