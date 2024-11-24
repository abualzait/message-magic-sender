import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUploader } from "@/components/FileUploader";
import { StatusTable } from "@/components/StatusTable";
import { ReportGenerator } from "@/components/ReportGenerator";
import { MessageStatus } from "@/types/messages";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [messageStatuses, setMessageStatuses] = useState<MessageStatus[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      // Check for file updates every 2 minutes
      if (file) {
        console.log("Checking for file updates...");
        // TODO: Implement file checking logic
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [file]);

  const handleFileUpload = (uploadedFile: File) => {
    console.log("File uploaded:", uploadedFile.name);
    setFile(uploadedFile);
    toast({
      title: "File uploaded successfully",
      description: `${uploadedFile.name} is ready for processing`,
    });
  };

  const startProcessing = () => {
    if (!file) return;
    console.log("Starting message processing");
    // Simulate progress for now
    let currentProgress = 0;
    const interval = setInterval(() => {
      if (currentProgress >= 100) {
        clearInterval(interval);
        return;
      }
      currentProgress += 10;
      setProgress(currentProgress);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-primary">WhatsApp Bulk Messenger</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Upload File</h2>
            <FileUploader onFileUpload={handleFileUpload} />
            {file && (
              <div className="mt-4">
                <Button onClick={startProcessing} className="w-full">
                  Start Processing
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Progress</h2>
            <Progress value={progress} className="mb-4" />
            <p className="text-muted-foreground text-center">{progress}% Complete</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Message Status</h2>
          <StatusTable statuses={messageStatuses} />
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Generate Report</h2>
          <ReportGenerator statuses={messageStatuses} />
        </Card>
      </div>
    </div>
  );
};

export default Index;