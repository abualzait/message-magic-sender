import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface ProcessingStatusProps {
  isProcessing: boolean;
  lastUpdate: string;
}

export const ProcessingStatus = ({ isProcessing, lastUpdate }: ProcessingStatusProps) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="font-medium">
            {isProcessing ? `Processing${dots}` : 'Idle'}
          </span>
        </div>
        <Badge variant={isProcessing ? "default" : "secondary"}>
          {lastUpdate}
        </Badge>
      </div>
    </Card>
  );
};