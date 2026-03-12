import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader2, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { callGeminiAPI } from '@/app/services/geminiService';

interface AIInsightsAccordionProps {
  title?: string;
  description?: string;
  context: string;
  pageContext?: any;
  className?: string;
}

interface AIInsight {
  type: 'success' | 'warning' | 'info';
  text: string;
}

export function AIInsightsAccordion({
  title = 'AI-Powered Insights',
  description = 'Data-driven recommendations based on student performance',
  context,
  pageContext,
  className = '',
}: AIInsightsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Build context-aware prompt
      let prompt = `You are an AI assistant for SenyamatiKard, a dashboard for monitoring Deaf and SPED students learning Functional Mathematics.

Analyze the following data and provide 3-5 concise, actionable insights. Each insight should be ONE sentence only.

For each insight, classify it as:
- "success" (positive trends, achievements)
- "warning" (concerns that need attention)
- "info" (neutral observations, recommendations)

Format your response EXACTLY as a JSON array like this:
[
  {"type": "success", "text": "Your insight text here"},
  {"type": "warning", "text": "Your insight text here"},
  {"type": "info", "text": "Your insight text here"}
]

`;

      // Add context-specific data
      if (context === 'dashboard') {
        prompt += `DASHBOARD DATA:\n`;
        if (pageContext?.stats) {
          prompt += `- Total Students: ${pageContext.stats.totalStudents}\n`;
          prompt += `- Active Students (last 7 days): ${pageContext.stats.activeStudents}\n`;
          prompt += `- Active Today: ${pageContext.stats.activeToday}\n`;
          prompt += `- Lessons Completed: ${pageContext.stats.lessonsCompleted}\n`;
          prompt += `- Average Progress: ${pageContext.stats.averageProgress}%\n`;
          prompt += `- Average Study Time: ${pageContext.stats.avgStudyTime} min/day\n`;
        }
        if (pageContext?.students) {
          const studentList = pageContext.students.map((s: any) => 
            `${s.name}: ${s.progress}% progress, ${s.lessonsCompleted} lessons`
          ).join('; ');
          prompt += `\nStudent Summary: ${studentList}\n`;
        }
      } else if (context === 'reports') {
        prompt += `REPORTS DATA:\n`;
        if (pageContext?.overallStats) {
          prompt += `- Total Lessons: ${pageContext.overallStats.totalLessons}\n`;
          prompt += `- Active Students: ${pageContext.overallStats.activeStudents}/${pageContext.overallStats.totalStudents}\n`;
          prompt += `- Completed Lessons: ${pageContext.overallStats.completedLessons}\n`;
          prompt += `- Average Completion: ${pageContext.overallStats.avgCompletion}%\n`;
          prompt += `- Average Assessment Score: ${pageContext.overallStats.overallAvgScore}%\n`;
          prompt += `- Total Assessments: ${pageContext.overallStats.totalAssessments}\n`;
        }
        if (pageContext?.lessonCompletionData) {
          const topLessons = pageContext.lessonCompletionData.slice(0, 3).map((l: any) => 
            `${l.title}: ${l.avgProgress}% avg, ${l.completed} completed`
          ).join('; ');
          prompt += `\nTop Lessons: ${topLessons}\n`;
        }
        if (pageContext?.assessmentScoresData) {
          const topAssessments = pageContext.assessmentScoresData.slice(0, 3).map((a: any) => 
            `${a.title}: ${a.avgScore}% avg, ${a.passRate}% pass rate`
          ).join('; ');
          prompt += `\nAssessments: ${topAssessments}\n`;
        }
      }

      prompt += `\nProvide insights that are specific, actionable, and helpful for teachers. Focus on patterns, achievements, and areas needing attention.`;

      const response = await callGeminiAPI(prompt);

      if (response.error) {
        setError(response.error.userMessage);
        setInsights([]);
      } else if (response.text) {
        try {
          // Try to parse JSON from the response
          let jsonText = response.text.trim();
          
          // Remove markdown code blocks if present
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          
          // Find JSON array in the text
          const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsedInsights = JSON.parse(jsonMatch[0]);
            
            // Validate the structure
            if (Array.isArray(parsedInsights) && parsedInsights.length > 0) {
              const validInsights = parsedInsights.filter(
                (insight) =>
                  insight.type &&
                  ['success', 'warning', 'info'].includes(insight.type) &&
                  insight.text &&
                  typeof insight.text === 'string'
              );
              
              if (validInsights.length > 0) {
                setInsights(validInsights);
                setHasGenerated(true);
              } else {
                setError('Unable to generate valid insights. Please try again.');
              }
            } else {
              setError('Unable to generate insights. Please try again.');
            }
          } else {
            setError('Unable to parse AI response. Please try again.');
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          setError('Unable to parse AI response. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error generating insights:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className={`border-2 shadow-sm hover:shadow-md transition-all ${className}`}>
      <CardHeader 
        className="bg-[var(--accent)]/20 pb-3 cursor-pointer hover:bg-[var(--accent)]/30 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[var(--primary)] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--accent)]" />
              {title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <button
            className="p-2 hover:bg-[var(--accent)]/50 rounded-lg transition-all"
            aria-label={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-[var(--primary)]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[var(--primary)]" />
            )}
          </button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-4 pb-4">
          {!hasGenerated && !isGenerating && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[#6B5539] mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Click the button below to generate AI-powered insights based on your current data
              </p>
              <Button
                onClick={handleGenerateInsights}
                className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-all"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Insights
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)] mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                AI is analyzing your data and generating insights...
              </p>
            </div>
          )}

          {error && !isGenerating && (
            <div className="text-center py-6">
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border-2 border-red-300 mb-4">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <Button
                onClick={handleGenerateInsights}
                variant="outline"
                className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
              >
                Try Again
              </Button>
            </div>
          )}

          {hasGenerated && insights.length > 0 && !isGenerating && (
            <>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all ${
                      insight.type === 'success'
                        ? 'bg-green-50 border-green-500'
                        : insight.type === 'warning'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {insight.type === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : insight.type === 'warning' ? (
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      )}
                      <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                        {insight.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-center">
                <Button
                  onClick={handleGenerateInsights}
                  variant="outline"
                  size="sm"
                  className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                >
                  <Sparkles className="h-3 w-3 mr-2" />
                  Regenerate Insights
                </Button>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
