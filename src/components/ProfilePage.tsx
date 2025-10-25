import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

interface User {
  email: string;
  role: "tutor" | "student";
  firstName: string;
  lastName: string;
}

interface TutorStats {
  activeStudents: number;
  lessonsThisMonth: number;
  plannedLessons: number;
}

interface StudentStats {
  lessonsCompleted: number;
  lessonsPlanned: number;
  totalHours: number;
}

type UserStats = TutorStats | StudentStats;

interface ProfilePageProps {
  user: User & { id: string };
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/stats/${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Nie udało się pobrać statystyk');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.id]);
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleDisplayName = (role: "tutor" | "student") => {
    return role === "tutor" ? "Lektor" : "Uczeń";
  };

  const getRoleDescription = (role: "tutor" | "student") => {
    return role === "tutor"
      ? "Prowadzisz lekcje języków obcych i zarządzasz kalendarzem dostępności"
      : "Uczysz się języków obcych i rezerwujesz lekcje z lektorami";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Profil użytkownika</h1>
        <p className="text-gray-600">Zarządzaj swoimi danymi osobowymi i ustawieniami konta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informacje osobowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-blue-600 text-white text-2xl font-semibold">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "tutor" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {getRoleDisplayName(user.role)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 max-w-md">{getRoleDescription(user.role)}</p>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Adres e-mail</span>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Rola w systemie</span>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-gray-900">{getRoleDisplayName(user.role)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edytuj profil
                </Button>
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Zmień hasło
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statystyki</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <>
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </>
              ) : error ? (
                <div className="text-center p-4 text-red-600">
                  {error}
                </div>
              ) : user.role === "tutor" ? (
                <>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(stats as TutorStats)?.activeStudents || 0}
                    </div>
                    <div className="text-sm text-blue-600">Aktywni uczniowie</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(stats as TutorStats)?.lessonsThisMonth || 0}
                    </div>
                    <div className="text-sm text-green-600">Lekcje w tym miesiącu</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(stats as TutorStats)?.plannedLessons || 0}
                    </div>
                    <div className="text-sm text-purple-600">Zaplanowane lekcje</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(stats as StudentStats)?.lessonsCompleted || 0}
                    </div>
                    <div className="text-sm text-blue-600">Odbyte lekcje</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(stats as StudentStats)?.lessonsPlanned || 0}
                    </div>
                    <div className="text-sm text-green-600">Zaplanowane lekcje</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(stats as StudentStats)?.totalHours || 0}
                    </div>
                    <div className="text-sm text-purple-600">Godziny nauki</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Szybkie akcje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.role === "tutor" ? (
                <>
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                      />
                    </svg>
                    Zarządzaj kalendarzem
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    Lista uczniów
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Zarezerwuj lekcję
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Moje postępy
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
