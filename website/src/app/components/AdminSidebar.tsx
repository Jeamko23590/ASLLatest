import React from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut, School } from 'lucide-react';
import { Logo } from '@/app/components/Logo';

interface AdminSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

const navItems = [
  { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'accounts', icon: Users, label: 'Accounts' },
  { id: 'classes', icon: School, label: 'Classes' },
  { id: 'reports', icon: FileText, label: 'Reports' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function AdminSidebar({ activeView, onViewChange, onLogout, isOpen = true, onClose, onToggle }: AdminSidebarProps) {
  const handleNavClick = (id: string) => {
    onViewChange(id);
    // Close mobile menu when a nav item is clicked
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative
        inset-y-0 left-0
        w-72
        bg-[var(--card)]
        border-r-2 border-[var(--border)]
        flex flex-col
        shadow-sm
        h-full
        z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b-2 border-[var(--border)]">
          <div className="flex items-start gap-3">
            {/* Logo Icon */}
            <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[#6B5539] flex items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-[#D4B84C] opacity-70" />
              <LayoutDashboard className="h-6 w-6 text-white relative z-10" strokeWidth={2.5} />
            </div>
            
            {/* Text Stack */}
            <div className="flex flex-col">
              <span className="heading-font text-2xl text-[var(--primary)] whitespace-nowrap">
                Senyamatika
              </span>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeView === item.id
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md'
                  : 'text-[var(--foreground)] hover:bg-[var(--accent)]/30'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t-2 border-[var(--border)]">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
