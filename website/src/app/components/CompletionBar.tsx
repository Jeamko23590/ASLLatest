import React from 'react';
import { Progress } from '@/app/components/ui/progress';

interface CompletionBarProps {
  percentage: number;
  label?: string;
  showPercentage?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

export function CompletionBar({ percentage, label, showPercentage = true, height = 'md' }: CompletionBarProps) {
  const heightClass = height === 'sm' ? 'h-2' : height === 'lg' ? 'h-4' : 'h-3';

  return (
    <div className="w-full space-y-1">
      {label && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{label}</span>
          {showPercentage && (
            <span className="font-medium text-foreground">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <Progress value={percentage} className={heightClass} />
    </div>
  );
}
