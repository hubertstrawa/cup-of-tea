import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  lessonsCompleted: number;
  lessonsReserved: number;
  profileCreatedAt: string;
}

interface StudentsDataTableProps {
  students: Student[];
  onViewStudent?: (studentId: string) => void;
  onSendMessage?: (studentId: string) => void;
  onRemoveStudent?: (studentId: string) => void;
}

export const StudentsDataTable: React.FC<StudentsDataTableProps> = ({
  students,
  onViewStudent,
  onSendMessage,
  onRemoveStudent,
}) => {
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Uczeń</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Lekcje odbyte</TableHead>
            <TableHead className="text-center">Lekcje zarezerwowane</TableHead>
            <TableHead className="text-center">Data dołączenia</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Brak uczniów do wyświetlenia
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {getUserInitials(student.firstName, student.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {student.firstName} {student.lastName}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {student.email}
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {student.lessonsCompleted}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {student.lessonsReserved}
                  </span>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {formatDate(student.profileCreatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onViewStudent && (
                        <DropdownMenuItem onClick={() => onViewStudent(student.id)}>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Zobacz profil
                        </DropdownMenuItem>
                      )}
                      {onSendMessage && (
                        <DropdownMenuItem onClick={() => onSendMessage(student.id)}>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Wyślij wiadomość
                        </DropdownMenuItem>
                      )}
                      {onRemoveStudent && (
                        <DropdownMenuItem 
                          onClick={() => onRemoveStudent(student.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Usuń ucznia
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
