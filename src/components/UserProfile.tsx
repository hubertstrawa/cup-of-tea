import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar } from './ui/avatar';
import { Button } from './ui/button';
import { LogoutButton } from './LogoutButton';

interface User {
  email: string;
  role: 'teacher' | 'student';
  firstName: string;
  lastName: string;
  id?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

interface UserProfileProps {
  user: User;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  showActions = true, 
  compact = false,
  className = ''
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleDisplayName = (role: 'teacher' | 'student') => {
    return role === 'teacher' ? 'Lektor' : 'Uczeń';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Brak danych';
    
    try {
      return new Date(dateString).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Nieprawidłowa data';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <Avatar className="h-8 w-8">
          <div className="h-full w-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
            {getInitials(user.firstName, user.lastName)}
          </div>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {getRoleDisplayName(user.role)}
          </p>
        </div>
        {showActions && (
          <LogoutButton variant="ghost" size="sm">
            Wyloguj
          </LogoutButton>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <div className="h-full w-full bg-blue-600 text-white flex items-center justify-center text-xl font-medium">
              {getInitials(user.firstName, user.lastName)}
            </div>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl">
              {user.firstName} {user.lastName}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {getRoleDisplayName(user.role)}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Adres e-mail</label>
            <p className="text-sm text-gray-900 mt-1">{user.email}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Rola</label>
            <p className="text-sm text-gray-900 mt-1">{getRoleDisplayName(user.role)}</p>
          </div>
          
          {user.createdAt && (
            <div>
              <label className="text-sm font-medium text-gray-700">Data rejestracji</label>
              <p className="text-sm text-gray-900 mt-1">{formatDate(user.createdAt)}</p>
            </div>
          )}
          
          {user.lastLoginAt && (
            <div>
              <label className="text-sm font-medium text-gray-700">Ostatnie logowanie</label>
              <p className="text-sm text-gray-900 mt-1">{formatDate(user.lastLoginAt)}</p>
            </div>
          )}
        </div>
        
        {showActions && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                Edytuj profil
              </Button>
              <LogoutButton variant="outline" size="sm" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
