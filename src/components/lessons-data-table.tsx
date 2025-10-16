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
import { Badge } from "./ui/badge";

interface Lesson {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "planned" | "completed" | "canceled";
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reservationId: string;
}

interface LessonsDataTableProps {
  lessons: Lesson[];
  onEditLesson?: (lessonId: string) => void;
  onCancelLesson?: (lessonId: string) => void;
  onMarkCompleted?: (lessonId: string) => void;
  onViewReservation?: (reservationId: string) => void;
}

export const LessonsDataTable: React.FC<LessonsDataTableProps> = ({
  lessons,
  onEditLesson,
  onCancelLesson,
  onMarkCompleted,
  onViewReservation,
}) => {
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("pl-PL"),
      time: date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const getStatusBadge = (status: "planned" | "completed" | "canceled") => {
    const statusConfig = {
      planned: { label: "Zaplanowana", variant: "default" as const },
      completed: { label: "Zakończona", variant: "secondary" as const },
      canceled: { label: "Anulowana", variant: "destructive" as const },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}min` : ""}`;
    }
    return `${mins}min`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data i godzina</TableHead>
            <TableHead>Uczeń</TableHead>
            <TableHead className="text-center">Czas trwania</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Brak lekcji do wyświetlenia
              </TableCell>
            </TableRow>
          ) : (
            lessons.map((lesson) => {
              const { date, time } = formatDateTime(lesson.scheduledAt);
              return (
                <TableRow key={lesson.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{date}</div>
                      <div className="text-sm text-muted-foreground">{time}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          {getUserInitials(lesson.student.firstName, lesson.student.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {lesson.student.firstName} {lesson.student.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {lesson.student.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium">
                      {formatDuration(lesson.durationMinutes)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(lesson.status)}
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
                        {onEditLesson && lesson.status === "planned" && (
                          <DropdownMenuItem onClick={() => onEditLesson(lesson.id)}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edytuj lekcję
                          </DropdownMenuItem>
                        )}
                        {onMarkCompleted && lesson.status === "planned" && (
                          <DropdownMenuItem onClick={() => onMarkCompleted(lesson.id)}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Oznacz jako zakończoną
                          </DropdownMenuItem>
                        )}
                        {onViewReservation && (
                          <DropdownMenuItem onClick={() => onViewReservation(lesson.reservationId)}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Zobacz rezerwację
                          </DropdownMenuItem>
                        )}
                        {onCancelLesson && lesson.status === "planned" && (
                          <DropdownMenuItem 
                            onClick={() => onCancelLesson(lesson.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Anuluj lekcję
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
