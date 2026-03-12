import React from 'react';
import { User, MessageSquare, Menu } from 'lucide-react';

interface TeacherTopBarProps {
  teacherName: string;
  onToggleAI: () => void;
  isAIPanelOpen: boolean;
  onToggleSidebar?: () => void;
}

export function TeacherTopBar({ teacherName, onToggleAI, isAIPanelOpen, onToggleSidebar }: TeacherTopBarProps) {
  return (
    <div className="h-16 bg-[var(--card)] border-b-2 border-[var(--border)] flex items-center justify-between px-4 sm:px-6">
      {/* Left Section - Hamburger Menu */}
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--accent)] transition-all"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
        <div className="flex-1"></div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Ask AI Button */}
        <button
          onClick={onToggleAI}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all ${
            isAIPanelOpen
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md'
              : 'bg-[var(--accent)] text-[var(--foreground)] hover:bg-[var(--primary)]/20'
          }`}
        >
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="font-medium text-xs sm:text-sm hidden xs:inline">Ask AI</span>
        </button>

        {/* Teacher Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-4 border-l-2 border-[var(--border)]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-[var(--foreground)]">{teacherName}</p>
            <p className="text-xs text-muted-foreground">Teacher</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[#6B5539] flex items-center justify-center shadow-md">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}