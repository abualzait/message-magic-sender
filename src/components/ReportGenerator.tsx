import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { MessageStatus } from "@/features/messages/types";

interface ReportGeneratorProps {
  statuses: MessageStatus[];
}

export const ReportGenerator = ({ statuses }: ReportGeneratorProps) => {
  const handleGenerateReport = () => {
    console.log("Generating report...");
    // TODO: Implement report generation
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input type="date" id="startDate" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input type="date" id="endDate" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="searchText">Search Text</Label>
        <Input type="text" id="searchText" placeholder="Search in message body..." />
      </div>
      <Button onClick={handleGenerateReport} className="w-full">
        Generate Report
      </Button>
    </div>
  );
};