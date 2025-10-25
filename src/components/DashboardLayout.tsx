import React, { useState } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
// import { Separator } from "./ui/separator";
import { LogoutButton } from "./LogoutButton";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeView?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    role: "tutor" | "student";
  };
}

interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  action?: () => void;
  icon: React.ReactNode;
  isActive?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, user, activeView = "calendar" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    ...(user?.role === "tutor" ? [
      {
        id: "calendar",
        label: "Kalendarz",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        ),
        href: "/dashboard",
        isActive: activeView === "calendar",
      },
      {
        id: "students",
        label: "Moi uczniowie",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
            />
          </svg>
        ),
        href: "/dashboard/students",
        isActive: activeView === "students",
      },
      {
        id: "lessons",
        label: "Moje lekcje",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        ),
        href: "/dashboard/lessons",
        isActive: activeView === "lessons",
      },
    ] : [
      {
        id: "dashboard",
        label: "Panel główny",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2h-4a2 2 0 01-2-2v0z"
            />
          </svg>
        ),
        href: "/dashboard",
        isActive: activeView === "dashboard",
      },
    ]),
    {
      id: "profile",
      label: "Profil",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      href: "/profile",
      isActive: activeView === "profile",
    },
  ];

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleLabel = (role: "tutor" | "student") => {
    return role === "tutor" ? "Lektor" : "Uczeń";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Cup of Tea</h1>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-6 border-b">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {getUserInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{getRoleLabel(user.role)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <div key={item.id}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <Button
                      variant={item.isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start space-x-3 ${
                        item.isActive ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-gray-700"
                      }`}
                      onClick={item.action}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Button>
                  )}
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Logout Section */}
          <div className="p-6 border-t">
            <LogoutButton
              variant="outline"
              className="w-full justify-start space-x-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Wyloguj się</span>
            </LogoutButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b lg:hidden">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
};
