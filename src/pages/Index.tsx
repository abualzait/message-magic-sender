import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { FileUploader } from "@/features/messages/components/FileUploader";
import { StatusTable } from "@/features/messages/components/StatusTable";
import { ProcessingStatus } from "@/features/messages/components/ProcessingStatus";
import { MessageStatus } from "@/features/messages/types";
import { wsService } from "@/features/messages/services/websocket";
import { processExcelFile } from "@/features/messages/utils/fileProcessing";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [folderPath, setFolderPath] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [messageStatuses, setMessageStatuses] = useState<MessageStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Takamol messaging hub";
    wsService.connect();

    const handler = (data: any) => {
      if (data.type === 'status_update') {
        logging(data);
        setMessageStatuses(prevStatuses => {
          return [...prevStatuses, {
            phoneNumber: data.phoneNumber,
            status: data.status,
            message: data.message,
            timestamp: data.timestamp,
            errorReason: data.error || undefined
          }];
        });
        setLastUpdate(new Date().toLocaleTimeString());
      } else if (data.type === 'process_complete') {
        setIsProcessing(false);
        toast({
          title: "Processing Complete",
          description: `Processed ${data.totalMessages} messages`,
        });
      }
    };

    wsService.addMessageHandler(handler);

    return () => {
      wsService.removeMessageHandler(handler);
      wsService.disconnect();
    };
  }, [toast]);

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsProcessing(true);
    try {
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

  const logging = (data: any) => {
    setLogs(prevLogs => [...prevLogs, `${data.timestamp} - ${data.phoneNumber}: ${data.message} - ${data.status}`]);
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

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Logs</h2>
          <pre className="bg-slate-800 text-white p-4 rounded-lg">{logs.join('\n')}</pre>
        </Card>
      </div>
    </div>
  );
};

export default Index;