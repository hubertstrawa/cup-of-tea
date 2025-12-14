import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  description: string;
  lessonsCompleted: number;
  lessonsReserved: number;
  totalLessonsCompleted: number;
  profileCreatedAt: string;
}

interface Lesson {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  reservationId: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface StudentDashboardProps {
  studentId: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ studentId }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch lessons
        const lessonsResponse = await fetch(`/api/students/${studentId}/lessons`);
        if (!lessonsResponse.ok) {
          const errorData = await lessonsResponse.json();
          console.error("Lessons API error:", errorData);
          throw new Error(`Failed to fetch lessons: ${errorData.error || lessonsResponse.statusText}`);
        }
        const lessonsData = await lessonsResponse.json();
        setUpcomingLessons(lessonsData.upcomingLessons || []);
        setCompletedLessons(lessonsData.completedLessons || []);

        // Fetch teachers
        const teachersResponse = await fetch(`/api/students/${studentId}/teachers`);
        if (!teachersResponse.ok) {
          const errorData = await teachersResponse.json();
          console.error("Teachers API error:", errorData);
          throw new Error(`Failed to fetch teachers: ${errorData.error || teachersResponse.statusText}`);
        }
        const teachersData = await teachersResponse.json();
        setTeachers(teachersData.teachers || []);
        console.log("teachersData", teachersData);
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="default">Zaplanowana</Badge>;
      case "completed":
        return <Badge variant="secondary">Ukończona</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Anulowana</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Błąd: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Panel ucznia</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zbliżające się lekcje</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingLessons.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukończone lekcje</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLessons.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moi lektorzy</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Lessons */}
        <Card>
          <CardHeader>
            <CardTitle>Zbliżające się lekcje</CardTitle>
            <CardDescription>Twoje nadchodzące lekcje z lektorami</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {upcomingLessons.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Brak zaplanowanych lekcji</div>
              ) : (
                <div className="space-y-4">
                  {upcomingLessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getUserInitials(lesson.teacher.firstName, lesson.teacher.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {lesson.teacher.firstName} {lesson.teacher.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(lesson.scheduledAt)}</p>
                        <p className="text-xs text-gray-400">{lesson.durationMinutes} minut</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">{getStatusBadge(lesson.status)}</div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Teachers List */}
        <Card>
          <CardHeader>
            <CardTitle>Moi lektorzy</CardTitle>
            <CardDescription>Lista twoich lektorów i postępy w nauce</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {teachers.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Nie masz jeszcze przypisanych lektorów</p>
                  <p className="text-sm mt-2">Aby zacząć naukę, umów pierwszą lekcję z lektorem.</p>
                  <Button variant="outline" className="mt-4">
                    <a href="/teachers">Przeglądaj lektorów</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-4 mb-3">
                        <Avatar>
                          <AvatarFallback className="bg-green-100 text-green-600">
                            {getUserInitials(teacher.firstName, teacher.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {teacher.firstName} {teacher.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{teacher.email}</p>
                        </div>
                      </div>

                      {teacher.bio && <p className="text-sm text-gray-600 mb-2">{teacher.bio}</p>}

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Ukończone lekcje: {teacher.lessonsCompleted}</span>
                        <span>Zarezerwowane: {teacher.lessonsReserved}</span>
                      </div>

                      <Separator className="my-2" />

                      <div className="flex justify-end items-center">
                        {/* <span className="text-xs text-gray-400">
                          Doświadczenie: {teacher.totalLessonsCompleted} lekcji
                        </span> */}
                        <Button variant="outline" size="sm">
                          <a href={`/tutor/${teacher.id}`}>Umów lekcję</a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Completed Lessons */}
      <Card>
        <CardHeader>
          <CardTitle>Ostatnie ukończone lekcje</CardTitle>
          <CardDescription>Historia twoich ostatnich lekcji</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {completedLessons.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Brak ukończonych lekcji</div>
            ) : (
              <div className="space-y-4">
                {completedLessons.slice(0, 10).map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-gray-100 text-gray-600">
                          {getUserInitials(lesson.teacher.firstName, lesson.teacher.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {lesson.teacher.firstName} {lesson.teacher.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(lesson.scheduledAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">{lesson.durationMinutes} min</span>
                      {getStatusBadge(lesson.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
