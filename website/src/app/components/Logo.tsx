import React from 'react';
import { LayoutDashboard } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'default' | 'light';
}

export function Logo({ size = 'md', showText = true, variant = 'default' }: LogoProps) {
  const sizeClasses = {
    sm: {
      container: 'w-8 h-8',
      icon: 'h-4 w-4',
      text: 'text-lg'
    },
    md: {
      container: 'w-12 h-12',
      icon: 'h-6 w-6',
      text: 'text-2xl'
    },
    lg: {
      container: 'w-20 h-20',
      icon: 'h-10 w-10',
      text: 'text-4xl'
    },
    xl: {
      container: 'w-24 h-24',
      icon: 'h-12 w-12',
      text: 'text-5xl'
    }
  };

  const classes = sizeClasses[size];
  const textColor = variant === 'light' ? 'text-white' : 'text-[var(--primary)]';

  return (
    <div className="flex items-center gap-3">
      {/* Logo Icon - Dashboard icon with geometric design */}
      <div className={`${classes.container} flex-shrink-0 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[#6B5539] flex items-center justify-center shadow-lg relative overflow-hidden`}>
        {/* Accent stripe - darker yellow */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#D4B84C] opacity-70" />
        
        {/* Dashboard icon */}
        <LayoutDashboard className={`${classes.icon} text-white relative z-10`} strokeWidth={2.5} />
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className={`heading-font ${classes.text} ${textColor} flex-shrink-0 whitespace-nowrap`}>
          SenyamatiKard
        </span>
      )}
    </div>
  );
}