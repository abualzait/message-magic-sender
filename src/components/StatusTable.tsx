import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { MessageStatus } from "@/types/messages";

interface StatusTableProps {
  statuses: MessageStatus[];
}

export const StatusTable = ({ statuses }: StatusTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Phone Number</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Error</TableHead>
          <TableHead>Timestamp</TableHead>
          <TableHead>Retries</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {statuses.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No messages processed yet
            </TableCell>
          </TableRow>
        ) : (
          statuses.map((status, index) => (
            <TableRow key={`${status.phoneNumber}-${index}`}>
              <TableCell>{status.phoneNumber}</TableCell>
              <TableCell className="max-w-md truncate">{status.message}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  status.status === 'sent' ? 'bg-green-100 text-green-800' :
                  status.status === 'failed' ? 'bg-red-100 text-red-800' :
                  status.status === 'retry' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {status.status}
                </span>
              </TableCell>
              <TableCell className="text-red-600">{status.errorReason || '-'}</TableCell>
              <TableCell>{new Date(status.timestamp).toLocaleString()}</TableCell>
              <TableCell>{status.retries}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};