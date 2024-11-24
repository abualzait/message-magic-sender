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
import * as XLSX from 'xlsx';

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

  const processExcelFile = async (file: File) => {
    return new Promise<MessageStatus[]>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);
        
        // Match the Python backend's column names
        const statuses: MessageStatus[] = rows.map((row: any) => ({
          phoneNumber: row.mobile_number?.toString() || '',  // Match Python's mobile_number
          message: row.msg_body || '',                       // Match Python's msg_body
          status: row.status?.toLowerCase() || 'pending',
          timestamp: new Date().toISOString(),
          retries: 0
        }));
        
        console.log("Processed Excel data:", statuses);
        resolve(statuses);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const triggerPythonScript = async (filePath: string) => {
    try {
      console.log("Triggering Python script for file:", filePath);
      const response = await fetch('http://localhost:5000/send-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger Python script');
      }

      const result = await response.json();
      console.log("Python script response:", result);
      
      toast({
        title: "WhatsApp Processing Started",
        description: "The Python script has been triggered to send WhatsApp messages.",
      });
    } catch (error) {
      console.error("Error triggering Python script:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the Python script. Please run it manually.",
        variant: "destructive",
      });
    }
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

  const startProcessing = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    console.log("Starting message processing");
    
    try {
      const statuses = await processExcelFile(file);
      let processed = 0;
      
      for (const status of statuses) {
        processed++;
        const progress = Math.round((processed / statuses.length) * 100);
        setProgress(progress);
        
        setMessageStatuses(prev => [...prev, {
          ...status,
          status: 'pending',
          timestamp: new Date().toISOString()
        }]);
      }

      // Save the file and trigger Python script
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const { filePath } = await response.json();
      await triggerPythonScript(filePath);

    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(100);
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
              {file && (
                <Button onClick={startProcessing} className="w-full" disabled={isProcessing}>
                  Process Excel File
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
                Processing Excel file...
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