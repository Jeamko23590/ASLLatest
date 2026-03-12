import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database, 
  GraduationCap,
  Palette,
  Save,
  Mail,
  Phone,
  Globe,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
  // System Settings State
  const [appName, setAppName] = React.useState('SenyamatiKard');
  const [timezone, setTimezone] = React.useState('Asia/Manila');
  const [language, setLanguage] = React.useState('Filipino');

  // Notification Settings State
  const [emailNewStudent, setEmailNewStudent] = React.useState(true);
  const [emailLowScores, setEmailLowScores] = React.useState(true);
  const [emailWeeklyReport, setEmailWeeklyReport] = React.useState(false);
  const [emailSystemUpdates, setEmailSystemUpdates] = React.useState(true);

  const handleSaveSystem = () => {
    toast.success('System settings saved successfully!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved successfully!');
  };

  const handleExportData = () => {
    toast.success('Data export initiated. You will receive an email when ready.');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="heading-font text-4xl text-[var(--primary)] mb-2 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--primary)] shadow-md">
            <SettingsIcon className="h-8 w-8 text-[var(--accent)]" />
          </div>
          Settings
        </h1>
        <p className="text-muted-foreground text-lg">Manage your preferences and account settings</p>
      </div>

      {/* System Settings */}
      <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
        <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent items-center pb-3">
          <CardTitle className="text-[var(--primary)] flex items-center gap-2 my-0">
            <SettingsIcon className="h-5 w-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-6 space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-[var(--foreground)] mb-2 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[var(--primary)]" />
              Application Name
            </h4>
            <Input
              id="appName"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="border-2 focus:border-[var(--primary)]"
            />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[var(--foreground)] mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--primary)]" />
              Timezone
            </h4>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-white"
            >
              <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
              <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
            </select>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[var(--foreground)] mb-2 flex items-center gap-2">
              <Globe className="h-4 w-4 text-[var(--primary)]" />
              Language
            </h4>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-white"
            >
              <option value="Filipino">Filipino</option>
              <option value="English">English</option>
              <option value="Cebuano">Cebuano</option>
            </select>
          </div>
          <Button 
            onClick={handleSaveSystem}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save System Settings
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
        <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent items-center pb-3">
          <CardTitle className="text-[var(--primary)] flex items-center gap-2 my-0">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-6 space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div>
              <p className="font-semibold text-[var(--foreground)]">New Student Registration</p>
              <p className="text-sm text-muted-foreground">Get notified when new students register</p>
            </div>
            <button
              onClick={() => setEmailNewStudent(!emailNewStudent)}
              className={`w-12 h-6 rounded-full transition-all ${
                emailNewStudent ? 'bg-[var(--primary)]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  emailNewStudent ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div>
              <p className="font-semibold text-[var(--foreground)]">Low Assessment Scores</p>
              <p className="text-sm text-muted-foreground">Alert when students score below passing</p>
            </div>
            <button
              onClick={() => setEmailLowScores(!emailLowScores)}
              className={`w-12 h-6 rounded-full transition-all ${
                emailLowScores ? 'bg-[var(--primary)]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  emailLowScores ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div>
              <p className="font-semibold text-[var(--foreground)]">Weekly Progress Report</p>
              <p className="text-sm text-muted-foreground">Receive weekly summary via email</p>
            </div>
            <button
              onClick={() => setEmailWeeklyReport(!emailWeeklyReport)}
              className={`w-12 h-6 rounded-full transition-all ${
                emailWeeklyReport ? 'bg-[var(--primary)]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  emailWeeklyReport ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div>
              <p className="font-semibold text-[var(--foreground)]">System Updates</p>
              <p className="text-sm text-muted-foreground">Important system announcements</p>
            </div>
            <button
              onClick={() => setEmailSystemUpdates(!emailSystemUpdates)}
              className={`w-12 h-6 rounded-full transition-all ${
                emailSystemUpdates ? 'bg-[var(--primary)]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  emailSystemUpdates ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <Button 
            onClick={handleSaveNotifications}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Notifications
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
        <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent items-center pb-3">
          <CardTitle className="text-[var(--primary)] flex items-center gap-2 my-0">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border-2 rounded-lg bg-white">
              <h3 className="font-semibold text-[var(--foreground)] mb-2">Export All Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download complete system data including students, lessons, and reports
              </p>
              <Button 
                onClick={handleExportData}
                variant="outline"
                className="w-full border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10"
              >
                <Database className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

            <div className="p-4 border-2 rounded-lg bg-white">
              <h3 className="font-semibold text-[var(--foreground)] mb-2">Backup System</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a complete backup of all system data and configurations
              </p>
              <Button 
                onClick={() => toast.success('Backup created successfully!')}
                variant="outline"
                className="w-full border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10"
              >
                <Database className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
            </div>

            <div className="p-4 border-2 rounded-lg bg-orange-50 border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-2">Data Privacy</h3>
              <p className="text-sm text-orange-700 mb-4">
                Review data retention policies and student privacy settings
              </p>
              <Button 
                onClick={() => toast.info('Data privacy settings panel (coming soon)')}
                variant="outline"
                className="w-full border-2 border-orange-600 text-orange-600 hover:bg-orange-100"
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacy Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}