import React, { useState, useEffect } from "react";
import { LessonsDataTable } from "./lessons-data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "./hooks/use-toast";

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

interface LessonsPageProps {
  userId: string;
}

export const LessonsPage: React.FC<LessonsPageProps> = ({ userId }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      lesson.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || lesson.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teachers/${userId}/lessons`);

      if (!response.ok) {
        throw new Error("Nie udało się pobrać listy lekcji");
      }

      const data = await response.json();
      setLessons(data.lessons || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać listy lekcji",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [userId]);

  const handleEditLesson = (/*lessonId: string*/) => {
    // Navigate to lesson edit page or open edit modal
    toast({
      title: "Funkcja w przygotowaniu",
      description: "Funkcja edycji lekcji będzie dostępna wkrótce",
    });
  };

  const handleCancelLesson = async (lessonId: string) => {
    if (!confirm("Czy na pewno chcesz anulować tę lekcję?")) {
      return;
    }

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "canceled" }),
      });

      if (!response.ok) {
        throw new Error("Nie udało się anulować lekcji");
      }

      toast({
        title: "Sukces",
        description: "Lekcja została anulowana",
      });

      // Refresh the lessons list
      fetchLessons();
    } catch (error) {
      console.error("Error canceling lesson:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się anulować lekcji",
        variant: "destructive",
      });
    }
  };

  const handleMarkCompleted = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "completed" }),
      });

      if (!response.ok) {
        throw new Error("Nie udało się oznaczyć lekcji jako zakończonej");
      }

      toast({
        title: "Sukces",
        description: "Lekcja została oznaczona jako zakończona",
      });

      // Refresh the lessons list
      fetchLessons();
    } catch (error) {
      console.error("Error marking lesson as completed:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się oznaczyć lekcji jako zakończonej",
        variant: "destructive",
      });
    }
  };

  const handleViewReservation = (reservationId: string) => {
    // Navigate to reservation details
    window.location.href = `/dashboard/reservations/${reservationId}`;
  };

  const getStatusCounts = () => {
    return {
      all: lessons.length,
      planned: lessons.filter((l) => l.status === "planned").length,
      completed: lessons.filter((l) => l.status === "completed").length,
      canceled: lessons.filter((l) => l.status === "canceled").length,
    };
  };

  const statusCounts = getStatusCounts();

  const LessonsTableSkeleton = () => (
    <div className="rounded-md border">
      <div className="border-b">
        <div className="grid grid-cols-5 gap-4 p-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border-b last:border-b-0">
          <div className="grid grid-cols-5 gap-4 p-4 items-center">
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex justify-center">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-center">
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Moje lekcje</h1>
          <p className="text-gray-600 mt-1">Zarządzaj swoimi lekcjami i śledź ich status</p>
        </div>
        <Button>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
            />
          </svg>
          Dodaj lekcję
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie lekcje</CardTitle>
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.all}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zaplanowane</CardTitle>
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statusCounts.planned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zakończone</CardTitle>
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anulowane</CardTitle>
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statusCounts.canceled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista lekcji</CardTitle>
              <CardDescription>Wszystkie lekcje przypisane do Twojego konta</CardDescription>
            </div>
            <div className="flex space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtruj po statusie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="planned">Zaplanowane</SelectItem>
                  <SelectItem value="completed">Zakończone</SelectItem>
                  <SelectItem value="canceled">Anulowane</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Szukaj po uczniu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-72"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            // <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <LessonsTableSkeleton />
          ) : (
            <LessonsDataTable
              lessons={filteredLessons}
              onEditLesson={handleEditLesson}
              onCancelLesson={handleCancelLesson}
              onMarkCompleted={handleMarkCompleted}
              onViewReservation={handleViewReservation}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
