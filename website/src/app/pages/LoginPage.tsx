import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Logo } from '@/app/components/Logo';
import { Eye, EyeOff, UserCircle, Shield, ChevronLeft, AlertCircle } from 'lucide-react';
import apiService from '@/app/services/apiService';

type UserRole = 'teacher' | 'admin';

interface LoginPageProps {
  onLogin: (role: UserRole, name: string) => void;
  onNavigateBack: () => void;
  preselectedRole?: UserRole | null;
}

export function LoginPage({ onLogin, onNavigateBack, preselectedRole }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(preselectedRole || null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !username || !password) return;

    setError('');
    setLoading(true);

    try {
      let response;
      
      if (selectedRole === 'teacher') {
        response = await apiService.teacherLogin(username, password);
      } else {
        response = await apiService.adminLogin(username, password);
      }

     // PALITAN NG:
// PALITAN NG:
if (response.success) {
  console.log('✅ Login successful:', response.data);
  onLogin(selectedRole, response.data?.user?.first_name || '');
}else {
        setError(response.error || 'Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Role Selection View
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-4xl w-full">
          {/* Back Button */}
          <button
            onClick={onNavigateBack}
            className="flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary)]/80 mb-6 sm:mb-8 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium text-sm sm:text-base">Back to Home</span>
          </button>

          {/* Logo and Title */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex justify-center mb-4 sm:mb-6">
              <Logo size="xl" showText={false} />
            </div>
            <h1 className="heading-font text-3xl sm:text-4xl md:text-5xl text-[var(--primary)] mb-2 sm:mb-3">Welcome Back</h1>
            <p className="text-base sm:text-lg text-muted-foreground px-4">
              Select your role to access SenyamatiKard Dashboard
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Card
              className="border-4 border-border hover:border-[var(--primary)] hover:shadow-2xl transition-all cursor-pointer group"
              onClick={() => setSelectedRole('teacher')}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <UserCircle className="h-10 w-10 text-[var(--accent-foreground)]" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-[var(--primary)] heading-font">Teacher Login</CardTitle>
                <CardDescription className="text-base mt-2">
                  Access student progress, lesson tracking, and AI insights
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white h-12">
                  Continue as Teacher
                </Button>
              </CardContent>
            </Card>

            <Card
              className="border-4 border-border hover:border-[var(--primary)] hover:shadow-2xl transition-all cursor-pointer group"
              onClick={() => setSelectedRole('admin')}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-[var(--accent-blue)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Shield className="h-10 w-10 text-[var(--primary)]" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-[var(--primary)] heading-font">Admin Login</CardTitle>
                <CardDescription className="text-base mt-2">
                  Manage accounts, lessons, classes, and system reports
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white h-12">
                  Continue as Admin
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Login Form View
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => setSelectedRole(null)}
          className="flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary)]/80 mb-6 sm:mb-8 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="font-medium text-sm sm:text-base">Change Role</span>
        </button>

        {/* Login Card */}
        <Card className="border-2 sm:border-4 border-border shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div 
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
                  selectedRole === 'teacher' 
                    ? 'bg-[var(--accent)]' 
                    : 'bg-[var(--accent-blue)]'
                }`}
              >
                {selectedRole === 'teacher' ? (
                  <UserCircle className="h-10 w-10 text-[var(--accent-foreground)]" />
                ) : (
                  <Shield className="h-10 w-10 text-[var(--primary)]" />
                )}
              </div>
            </div>
            <CardTitle className="text-3xl text-[var(--primary)] heading-font">
              {selectedRole === 'teacher' ? 'Teacher Login' : 'Admin Login'}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border-2 border-red-200 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Username / Employee ID Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[var(--foreground)]">
                  {selectedRole === 'teacher' ? 'Employee ID' : 'Email'}
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={selectedRole === 'teacher' ? 'Enter employee ID (e.g., EMP-001)' : 'Enter email'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 border-2 border-border focus:border-[var(--primary)] bg-[var(--input-background)] text-base"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[var(--foreground)]">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-2 border-border focus:border-[var(--primary)] bg-[var(--input-background)] pr-12 text-base"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[var(--primary)] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login to Dashboard'}
              </Button>

              {/* Helper Text */}
              <div className="text-sm text-center text-muted-foreground space-y-1">
                <p>Designed for easy reading and comfortable use for all users</p>
                {selectedRole === 'teacher' && (
                  <p className="text-xs text-[var(--primary)]">
                    Demo: EMP-001 / cruz_001
                  </p>
                )}
                {selectedRole === 'admin' && (
                  <p className="text-xs text-[var(--primary)]">
                    Demo: admin@senyamatika.com / admin123
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Secure access to SenyamatiKard Dashboard
          </p>
        </div>
      </div>
    </div>
  );
}