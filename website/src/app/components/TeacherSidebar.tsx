import React from 'react';
import { BarChart3, TrendingUp, FileText, LogOut, LayoutDashboard, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';

interface TeacherSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: 'students', icon: Users, label: 'Students' },
  { id: 'progress', icon: TrendingUp, label: 'Progress' },
  { id: 'reports', icon: FileText, label: 'Reports' },
];

export function TeacherSidebar({ activeView, onViewChange, onLogout, isOpen = true, onClose }: TeacherSidebarProps) {
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
        w-64 md:w-20
        bg-[var(--sidebar)]
        flex flex-col
        py-6 md:py-6
        shadow-lg
        h-full
        z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-center md:justify-center px-6 md:px-0 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[#6B5539] flex items-center justify-center shadow-md relative overflow-hidden">
            {/* Accent stripe */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#D4B84C] opacity-70" />
            {/* Dashboard icon */}
            <LayoutDashboard className="h-5 w-5 text-white relative z-10" strokeWidth={2.5} />
          </div>
          <span className="md:hidden ml-3 font-bold text-lg text-[var(--sidebar-foreground)]">SenyamatiKard</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col space-y-2 md:space-y-4 mb-auto px-4 md:px-0 md:items-center">
          {navItems.map((item) => (
            <TooltipProvider key={item.id} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      w-full md:w-12 h-12 rounded-xl
                      flex items-center md:justify-center
                      px-4 md:px-0
                      gap-3 md:gap-0
                      transition-all
                      ${
                        activeView === item.id
                          ? 'bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-lg md:scale-110'
                          : 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:scale-105'
                      }
                    `}
                    aria-label={item.label}
                  >
                    <item.icon className="h-6 w-6 flex-shrink-0" />
                    <span className="md:hidden font-medium">{item.label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="hidden md:block bg-[var(--card)] text-[var(--card-foreground)] border-2 border-[var(--border)] shadow-lg">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>

        {/* Bottom Actions - Logout */}
        <div className="flex flex-col px-4 md:px-0 md:items-center">
          {/* Logout Button */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onLogout}
                  className="w-full md:w-12 h-12 rounded-xl flex items-center md:justify-center px-4 md:px-0 gap-3 md:gap-0 text-[var(--sidebar-foreground)] hover:bg-red-600 hover:text-white transition-all hover:scale-105"
                  aria-label="Logout"
                >
                  <LogOut className="h-6 w-6 flex-shrink-0" />
                  <span className="md:hidden font-medium">Logout</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="hidden md:block bg-[var(--card)] text-[var(--card-foreground)] border-2 border-[var(--border)] shadow-lg">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </>
  );
}
