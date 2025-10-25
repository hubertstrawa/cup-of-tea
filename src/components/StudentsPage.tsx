import React, { useState, useEffect } from "react";
import { StudentsDataTable } from "./students-data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "./hooks/use-toast";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  lessonsCompleted: number;
  lessonsReserved: number;
  profileCreatedAt: string;
}

interface StudentsPageProps {
  userId: string;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({ userId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredStudents = students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teachers/${userId}/students`);
      
      if (!response.ok) {
        throw new Error("Nie udało się pobrać listy uczniów");
      }

      const data = await response.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać listy uczniów",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [userId]);

  const handleViewStudent = (studentId: string) => {
    // Navigate to student profile or show student details
    window.location.href = `/dashboard/students/${studentId}`;
  };

  const handleSendMessage = (studentId: string) => {
    // Implement messaging functionality
    toast({
      title: "Funkcja w przygotowaniu",
      description: "Funkcja wysyłania wiadomości będzie dostępna wkrótce",
    });
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tego ucznia?")) {
      return;
    }

    try {
      const response = await fetch(`/api/teachers/${userId}/students/${studentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć ucznia");
      }

      toast({
        title: "Sukces",
        description: "Uczeń został usunięty",
      });

      // Refresh the students list
      fetchStudents();
    } catch (error) {
      console.error("Error removing student:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć ucznia",
        variant: "destructive",
      });
    }
  };

  const totalLessonsCompleted = students.reduce((sum, student) => sum + student.lessonsCompleted, 0);
  const totalLessonsReserved = students.reduce((sum, student) => sum + student.lessonsReserved, 0);

  const StudentsTableSkeleton = () => (
    <div className="rounded-md border">
      <div className="border-b">
        <div className="grid grid-cols-6 gap-4 p-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border-b last:border-b-0">
          <div className="grid grid-cols-6 gap-4 p-4 items-center">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-32" />
            <div className="flex justify-center">
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <div className="flex justify-center">
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <Skeleton className="h-4 w-20 mx-auto" />
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
          <h1 className="text-3xl font-bold text-gray-900">Moi uczniowie</h1>
          <p className="text-gray-600 mt-1">
            Zarządzaj swoimi uczniami i śledź ich postępy
          </p>
        </div>
        <Button>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Dodaj ucznia
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Łączna liczba uczniów</CardTitle>
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lekcje odbyte</CardTitle>
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessonsCompleted}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lekcje zarezerwowane</CardTitle>
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessonsReserved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista uczniów</CardTitle>
              <CardDescription>
                Wszyscy uczniowie przypisani do Twojego konta
              </CardDescription>
            </div>
            <div className="w-72">
              <Input
                placeholder="Szukaj uczniów..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <StudentsTableSkeleton />
          ) : (
            <StudentsDataTable
              students={filteredStudents}
              onViewStudent={handleViewStudent}
              onSendMessage={handleSendMessage}
              onRemoveStudent={handleRemoveStudent}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
