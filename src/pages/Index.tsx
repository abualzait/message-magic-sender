import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { FileUploader } from "@/components/FileUploader";
import { StatusTable } from "@/components/StatusTable";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { MessageStatus } from "@/types/messages";
import { wsService } from "@/services/websocket";
import { processExcelFile } from "@/utils/fileProcessing";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [folderPath, setFolderPath] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [messageStatuses, setMessageStatuses] = useState<MessageStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Takamol messaging hub";
    wsService.connect();

    wsService.addMessageHandler((data) => {
      console.log("Processing status update:", data);
      if (data.type === 'status_update') {
        setMessageStatuses(prevStatuses => {
          return prevStatuses.map(status => {
            if (status.phoneNumber === data.phoneNumber) {
              return {
                ...status,
                status: data.status,
                errorReason: data.error || undefined,
                timestamp: new Date().toISOString()
              };
            }
            return status;
          });
        });
        setLastUpdate(new Date().toLocaleTimeString());
      } else if (data.type === 'process_complete') {
        setIsProcessing(false);
        toast({
          title: "Processing Complete",
          description: `Processed ${data.totalMessages} messages`,
        });
      }
    });

    return () => {
      // Cleanup
    };
  }, [toast]);

  const handleFileUpload = async (uploadedFile: File) => {
    console.log("File uploaded:", uploadedFile.name);
    setFile(uploadedFile);
    setIsProcessing(true);
    
    try {
      const statuses = await processExcelFile(uploadedFile);
      setMessageStatuses(statuses);
      
      const formData = new FormData();
      formData.append('file', uploadedFile);
      
      const uploadResponse = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const { filePath } = await uploadResponse.json();
      console.log("File uploaded successfully, path:", filePath);
      
      toast({
        title: "Processing Started",
        description: "Your file is being processed",
      });
    } catch (error) {
      console.error("Error processing file:", error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-primary">Takamol messaging hub</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Upload File</h2>
            <FileUploader onFileUpload={handleFileUpload} />
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Monitor Folder</label>
              <Input
                type="text"
                placeholder="Enter folder path"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Progress</h2>
            <ProcessingStatus isProcessing={isProcessing} lastUpdate={lastUpdate} />
            <Progress value={progress} className="mt-4" />
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Live Message Status</h2>
          <StatusTable statuses={messageStatuses} />
        </Card>
      </div>
    </div>
  );
};

export default Index;