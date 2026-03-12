import React from 'react';

interface MarkdownRendererProps {
  text: string;
}

/**
 * Simple markdown renderer for AI responses
 * Supports: **bold**, *italic*, `code`, numbered lists, bullet points
 */
export function MarkdownRenderer({ text }: MarkdownRendererProps) {
  const renderLine = (line: string, index: number) => {
    // Handle numbered lists (1. text, 2. text, etc.)
    const numberedListMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numberedListMatch) {
      const [, number, content] = numberedListMatch;
      return (
        <div key={index} className="flex gap-2 mb-1">
          <span className="font-bold flex-shrink-0">{number}.</span>
          <span>{renderInlineFormatting(content)}</span>
        </div>
      );
    }

    // Handle bullet points (- text or * text)
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      return (
        <div key={index} className="flex gap-2 mb-1">
          <span className="flex-shrink-0">•</span>
          <span>{renderInlineFormatting(bulletMatch[1])}</span>
        </div>
      );
    }

    // Empty lines create paragraph breaks
    if (!line.trim()) {
      return <div key={index} className="h-2" />;
    }

    // Regular line
    return (
      <div key={index} className="mb-1">
        {renderInlineFormatting(line)}
      </div>
    );
  };

  const renderInlineFormatting = (text: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let keyCounter = 0;

    // Combined regex for **bold**, *italic*, and `code`
    const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      if (match[1]) {
        // **bold**
        parts.push(
          <strong key={`bold-${keyCounter++}`} className="font-bold">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // *italic*
        parts.push(
          <em key={`italic-${keyCounter++}`} className="italic">
            {match[4]}
          </em>
        );
      } else if (match[5]) {
        // `code`
        parts.push(
          <code
            key={`code-${keyCounter++}`}
            className="px-1.5 py-0.5 bg-black/10 rounded text-sm font-mono"
          >
            {match[6]}
          </code>
        );
      }

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Split text into lines and render each, filtering out trailing empty lines
  const lines = text.split('\n');
  
  // Remove trailing empty lines
  while (lines.length > 0 && !lines[lines.length - 1].trim()) {
    lines.pop();
  }

  return (
    <div className="space-y-0">
      {lines.map((line, index) => renderLine(line, index))}
    </div>
  );
}