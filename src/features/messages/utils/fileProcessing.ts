import * as XLSX from 'xlsx';
import { MessageStatus } from "../types";

export const processExcelFile = async (file: File): Promise<MessageStatus[]> => {
  console.log("Processing Excel file:", file.name);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);
        
        const statuses: MessageStatus[] = rows.map((row: any) => ({
          phoneNumber: row.mobile_number?.toString() || '',
          message: row.msg_body || '',
          status: 'pending',
          timestamp: new Date().toISOString(),
          retries: 0
        }));
        
        console.log("Processed Excel data:", statuses);
        resolve(statuses);
      } catch (error) {
        console.error("Error processing Excel file:", error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};
