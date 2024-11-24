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
          <TableHead>Timestamp</TableHead>
          <TableHead>Retries</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {statuses.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No messages processed yet
            </TableCell>
          </TableRow>
        ) : (
          statuses.map((status, index) => (
            <TableRow key={`${status.phoneNumber}-${index}`}>
              <TableCell>{status.phoneNumber}</TableCell>
              <TableCell className="max-w-md truncate">{status.message}</TableCell>
              <TableCell>{status.status}</TableCell>
              <TableCell>{new Date(status.timestamp).toLocaleString()}</TableCell>
              <TableCell>{status.retries}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};