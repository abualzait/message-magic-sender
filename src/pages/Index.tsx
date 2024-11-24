import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { FileUploader } from "@/components/FileUploader";
import { StatusTable } from "@/components/StatusTable";
import { ReportGenerator } from "@/components/ReportGenerator";
import { MessageStatus } from "@/types/messages";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [folderPath, setFolderPath] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [messageStatuses, setMessageStatuses] = useState<MessageStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Takamol messaging hub";
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (folderPath && !isProcessing) {
        console.log("Checking folder for new files...");
        checkNewFiles();
      }
    }, 120000); // Check every 2 minutes

    return () => clearInterval(interval);
  }, [folderPath, isProcessing]);

  const checkNewFiles = async () => {
    console.log("Checking for new files in:", folderPath);
    // TODO: Implement folder checking logic
    // This would typically be handled by a backend service
  };

  const handleFileUpload = (uploadedFile: File) => {
    console.log("File uploaded:", uploadedFile.name);
    setFile(uploadedFile);
    toast({
      title: "File uploaded successfully",
      description: `${uploadedFile.name} is ready for processing`,
    });
  };

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFolderPath(event.target.value);
    console.log("Folder path set to:", event.target.value);
    toast({
      title: "Folder path set",
      description: "System will monitor this folder for new files",
    });
  };

  const startProcessing = () => {
    if (!file && !folderPath) return;
    
    setIsProcessing(true);
    console.log("Starting message processing");
    
    // Simulate message processing
    let currentProgress = 0;
    const interval = setInterval(() => {
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsProcessing(false);
        
        // Add a mock status for demonstration
        const newStatus: MessageStatus = {
          phoneNumber: "+1234567890",
          status: "sent",
          timestamp: new Date().toISOString(),
          retries: 0,
          message: "Test message",
        };
        
        setMessageStatuses(prev => [...prev, newStatus]);
        return;
      }
      currentProgress += 10;
      setProgress(currentProgress);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-primary">Takamol messaging hub</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Upload File</h2>
            <FileUploader onFileUpload={handleFileUpload} />
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Monitor Folder</label>
                <Input
                  type="text"
                  placeholder="Enter folder path"
                  value={folderPath}
                  onChange={handleFolderSelect}
                />
              </div>
              {(file || folderPath) && (
                <Button onClick={startProcessing} className="w-full" disabled={isProcessing}>
                  Start Processing
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Progress</h2>
            <Progress value={progress} className="mb-4" />
            <p className="text-muted-foreground text-center">{progress}% Complete</p>
            {isProcessing && (
              <p className="text-center mt-2 text-sm text-muted-foreground">
                Processing messages...
              </p>
            )}
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Live Message Status</h2>
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