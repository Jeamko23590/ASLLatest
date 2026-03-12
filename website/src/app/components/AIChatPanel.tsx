import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { callGeminiAPI, buildContextPrompt } from '@/app/services/geminiService';
import { MarkdownRenderer } from '@/app/components/MarkdownRenderer';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
  pageContext?: any;
}

interface Message {
  id: string;
  type: 'user' | 'ai' | 'error';
  text: string;
  timestamp: Date;
}

export function AIChatPanel({ isOpen, onClose, currentPage = 'dashboard', pageContext }: AIChatPanelProps) {
  const initialMessage: Message = {
    id: '1',
    type: 'ai',
    text: 'Hi there! 👋 I\'m here to help you make sense of your student data and progress. Whether you\'re curious about trends, need teaching insights, or just want to understand how your students are doing - I\'ve got you covered. What would you like to explore today?',
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Build context-aware prompt for the current question
    const prompt = buildContextPrompt(inputText, currentPage, pageContext);

    // Build conversation history (excluding the initial greeting and current message)
    const conversationHistory = messages
      .filter(msg => msg.type !== 'error') // Exclude error messages
      .slice(1) // Skip the initial greeting message
      .map(msg => ({
        role: msg.type === 'user' ? 'user' : 'ai',
        text: msg.text,
      }));

    try {
      // Call Gemini API with conversation history
      const response = await callGeminiAPI(prompt, conversationHistory);

      if (response.error) {
        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'error',
          text: response.error.userMessage,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else if (response.text) {
        // Add AI response
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          text: response.text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      // Handle unexpected errors
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        text: 'An unexpected error occurred. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Only send if not loading
      if (!isLoading) {
        handleSendMessage();
      }
    }
  };

  const handleNewConversation = () => {
    // Reset conversation to initial state
    setMessages([{
      id: Date.now().toString(),
      type: 'ai',
      text: 'Hi there! 👋 I\'m here to help you make sense of your student data and progress. Whether you\'re curious about trends, need teaching insights, or just want to understand how your students are doing - I\'ve got you covered. What would you like to explore today?',
      timestamp: new Date(),
    }]);
    setInputText('');
  };

  if (!isOpen) return null;

  return (
    <div className={`
        fixed md:relative
        inset-y-0 right-0
        w-full sm:w-96
        h-full
        bg-[var(--card)]
        border-l-2 border-[var(--border)]
        flex flex-col
        shadow-lg
        z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
      {/* Header */}
      <div className="p-4 border-b-2 border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[#6B5539] flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-[var(--foreground)]">AI Assistant</h2>
            <p className="text-xs text-muted-foreground">Powered by Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewConversation}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-all"
            aria-label="Start new conversation"
            title="Start new conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-all"
            aria-label="Close AI Panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Page Context Badge */}
      {currentPage && (
        <div className="px-4 py-2 bg-[var(--accent)]/30 border-b border-[var(--border)]">
          <p className="text-xs text-muted-foreground">
            Context: <span className="font-semibold text-[var(--foreground)] capitalize">{currentPage}</span> page
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${ 
                message.type === 'user'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : message.type === 'error'
                  ? 'bg-red-100 text-red-800 border-2 border-red-300'
                  : 'bg-[var(--accent)] text-[var(--foreground)]'
              }`}
            >
              {message.type === 'error' && (
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-xs font-semibold">Error</span>
                </div>
              )}
              <div className="text-sm">
                <MarkdownRenderer text={message.text} />
              </div>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--accent)] text-[var(--foreground)] rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t-2 border-[var(--border)]">
        <div className="flex space-x-2 items-end">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            rows={1}
            className="flex-1 px-4 py-2 rounded-lg border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-all resize-none overflow-y-auto"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {/* Helpful tips */}
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Ask about student progress, trends, or insights • Press Enter to send
        </p>
      </div>
    </div>
  );
}