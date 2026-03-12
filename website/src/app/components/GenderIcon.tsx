import React from 'react';
import { User } from 'lucide-react';

interface GenderIconProps {
  gender: 'male' | 'female' | 'nonbinary';
  className?: string;
}

export function GenderIcon({ gender, className = '' }: GenderIconProps) {
  const getColor = () => {
    switch (gender) {
      case 'male':
        return 'var(--gender-male)';
      case 'female':
        return 'var(--gender-female)';
      case 'nonbinary':
        return 'var(--gender-nonbinary)';
      default:
        return 'currentColor';
    }
  };

  return (
    <User
      className={className}
      style={{ color: getColor() }}
      strokeWidth={2.5}
    />
  );
}
