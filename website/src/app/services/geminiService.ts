const GEMINI_API_KEY = 'AIzaSyDOZj3Bf1Cdis0yg_NW47RqHbBOQL2rqe8';
const GEMINI_MODEL = 'models/gemma-3-27b-it';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export interface GeminiError {
  code: number;
  message: string;
  userMessage: string;
}

export interface GeminiResponse {
  text: string;
  error?: GeminiError;
}

/**
 * Call Gemini API with a prompt
 */
export async function callGeminiAPI(prompt: string, conversationHistory?: Array<{role: string, text: string}>): Promise<GeminiResponse> {
  try {
    // Build contents array with conversation history
    const contents = [];
    
    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      });
    }
    
    // Add current prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });
    
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
      }),
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      switch (response.status) {
        case 429:
          return {
            text: '',
            error: {
              code: 429,
              message: 'Rate limit exceeded',
              userMessage: 'Too many requests. Please wait a moment before trying again.',
            },
          };
        
        case 403:
          return {
            text: '',
            error: {
              code: 403,
              message: 'Authentication failed',
              userMessage: 'API authentication failed. Please check your API key configuration.',
            },
          };
        
        case 400:
          return {
            text: '',
            error: {
              code: 400,
              message: errorData.error?.message || 'Invalid request',
              userMessage: 'Invalid request. Please try rephrasing your question.',
            },
          };
        
        case 404:
          return {
            text: '',
            error: {
              code: 404,
              message: 'Model not found',
              userMessage: 'AI model not available. Please contact support.',
            },
          };
        
        default:
          return {
            text: '',
            error: {
              code: response.status,
              message: errorData.error?.message || 'Unknown error',
              userMessage: `An error occurred (${response.status}). Please try again later.`,
            },
          };
      }
    }

    const data = await response.json();

    // Extract response text
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return {
        text: data.candidates[0].content.parts[0].text,
      };
    }

    // Handle blocked or filtered content
    if (data.candidates?.[0]?.finishReason === 'SAFETY') {
      return {
        text: '',
        error: {
          code: 0,
          message: 'Content filtered',
          userMessage: 'Your request was filtered for safety reasons. Please try a different question.',
        },
      };
    }

    // No valid response
    return {
      text: '',
      error: {
        code: 0,
        message: 'No response generated',
        userMessage: 'Unable to generate a response. Please try again.',
      },
    };
  } catch (error) {
    // Network or other errors
    return {
      text: '',
      error: {
        code: 0,
        message: error instanceof Error ? error.message : 'Unknown error',
        userMessage: 'Network error. Please check your connection and try again.',
      },
    };
  }
}

/**
 * Build context-aware prompt based on current page and data
 */
export function buildContextPrompt(
  userQuestion: string,
  currentPage: string,
  pageContext?: any
): string {
  let systemContext = `You are an AI assistant for SenyamatiKard, a monitoring and reporting dashboard for the Senyamatika mobile app that teaches Functional Mathematics to Deaf and SPED students.

You are helping a teacher analyze student data and progress. Be helpful, concise, and data-driven in your responses.

If the user asks something unrelated to education or student progress, politely redirect them in a friendly, natural way - never be robotic or dismissive.

Current Context:`;

  switch (currentPage) {
    case 'dashboard':
      systemContext += `\n- The teacher is viewing the Dashboard page
- This page shows overall statistics, activity trends, engagement metrics, and recent activities
- Available metrics include: total students, active students, lessons completed, average progress
- Help analyze trends, identify patterns, and provide actionable insights`;
      
      if (pageContext?.stats) {
        systemContext += `\n\nCurrent Statistics:
- Total Students: ${pageContext.stats.totalStudents}
- Active Students (last 7 days): ${pageContext.stats.activeStudents}
- Active Students Today: ${pageContext.stats.activeToday}
- Lessons Completed: ${pageContext.stats.lessonsCompleted}
- Assessments Completed: ${pageContext.stats.assessmentsCompleted}
- Average Progress: ${pageContext.stats.averageProgress}%
- Average Study Time: ${pageContext.stats.avgStudyTime} minutes per student per day`;
      }
      
      if (pageContext?.students && pageContext.students.length > 0) {
        const studentsList = pageContext.students.map((s: any) => 
          `  - ${s.name}: ${s.progress}% progress, ${s.lessonsCompleted} lessons completed`
        ).join('\n');
        systemContext += `\n\nStudent List (Total: ${pageContext.students.length}):\n${studentsList}`;
      }
      
      if (pageContext?.lessonCompletionTrend) {
        const trendData = pageContext.lessonCompletionTrend.map((d: any) => 
          `${d.day}: ${d.completed} completed, ${d.assessed} assessed`
        ).join(', ');
        systemContext += `\n\n7-Day Activity Trend: ${trendData}`;
      }
      
      if (pageContext?.engagementOverview) {
        const engagementData = pageContext.engagementOverview.map((e: any) => 
          `${e.category}: ${e.engaged} engaged, ${e.completed} completed`
        ).join('; ');
        systemContext += `\n\nLesson Engagement by Category: ${engagementData}`;
      }
      
      if (pageContext?.performanceDistribution) {
        const perfData = pageContext.performanceDistribution.map((p: any) => 
          `${p.name} (${p.range}): ${p.value} students`
        ).join(', ');
        systemContext += `\n\nPerformance Distribution: ${perfData}`;
      }
      
      if (pageContext?.recentActivity) {
        const activities = pageContext.recentActivity.slice(0, 3).map((a: any) => 
          `${a.student} - ${a.action} (${a.time})`
        ).join('; ');
        systemContext += `\n\nRecent Activity: ${activities}`;
      }
      break;

    case 'students':
      systemContext += `\n- The teacher is viewing the Students page
- This page shows a list of all students with their progress and performance
- Help analyze individual student performance, compare students, and identify students who need attention`;
      
      if (pageContext?.students && pageContext.students.length > 0) {
        systemContext += `\n\nDetailed Student Information:\n`;
        
        pageContext.students.forEach((s: any) => {
          systemContext += `\n${s.name}:
  - Overall Progress: ${s.progress}%
  - Completion Rate: ${s.completionRate}%
  - Lessons Completed: ${s.lessonsCompleted}/${s.totalLessons}
  - Average Assessment Score: ${s.avgScore}%
  - Performance Level: ${s.performanceLevel}
  - Assessments Taken: ${s.assessmentsTaken}`;
          
          // Add detailed lesson progress
          if (s.lessonProgress && s.lessonProgress.length > 0) {
            systemContext += `\n  - Lesson Progress:`;
            s.lessonProgress.forEach((lp: any) => {
              const status = lp.isCompleted ? '✓ Completed' : `In Progress (${lp.percentage}%)`;
              systemContext += `\n    • ${lp.lessonTitle}: ${status} - ${lp.completedSubtopics}/${lp.totalSubtopics} subtopics`;
            });
          }
          
          // Add detailed assessment scores
          if (s.assessments && s.assessments.length > 0) {
            systemContext += `\n  - Assessments Completed:`;
            s.assessments.forEach((a: any) => {
              systemContext += `\n    • ${a.lessonTitle}: ${a.score}/${a.maxScore} (${a.percentage}%) on ${a.completedAt}`;
            });
          } else {
            systemContext += `\n  - No assessments taken yet`;
          }
        });
        
        systemContext += `\n\nClass Averages:
- Average Progress: ${pageContext.averageProgress}%
- Average Score: ${pageContext.averageScore}%
- Total Assessments Taken: ${pageContext.totalAssessmentsTaken}`;
        
        if (pageContext.performanceSummary) {
          systemContext += `\n\nPerformance Summary:
- Excellent (≥85%): ${pageContext.performanceSummary.excellent} students
- Good (70-84%): ${pageContext.performanceSummary.good} students
- Fair (60-69%): ${pageContext.performanceSummary.fair} students
- Needs Help (<60%): ${pageContext.performanceSummary.needsHelp} students`;
        }
        
        // Add available lessons and assessments info
        if (pageContext.lessons) {
          const lessonTitles = pageContext.lessons.map((l: any) => l.title).join(', ');
          systemContext += `\n\nAvailable Lessons (${pageContext.lessons.length}): ${lessonTitles}`;
        }
        
        if (pageContext.assessments) {
          systemContext += `\n\nAvailable Assessments:`;
          pageContext.assessments.forEach((a: any) => {
            systemContext += `\n  - ${a.title} (${a.lessonTitle})`;
          });
        }
      }
      break;

    case 'progress':
      systemContext += `\n- The teacher is viewing the Progress Tracking page
- This page shows lesson completion status and detailed progress metrics
- Help analyze lesson completion patterns, identify difficult lessons, and track overall class progress`;
      
      if (pageContext?.summaryStats) {
        systemContext += `\n\nSummary Statistics:
- Total Lessons: ${pageContext.summaryStats.totalLessons}
- Lessons Completed: ${pageContext.summaryStats.completedLessons}
- Average Progress: ${pageContext.summaryStats.avgProgress}%
- Completion Rate: ${pageContext.summaryStats.completionRate}%
- In Progress: ${pageContext.summaryStats.inProgress}`;
      }
      
      if (pageContext?.lessons && pageContext.lessons.length > 0) {
        const lessonsList = pageContext.lessons.map((l: any) => {
          const subtopicsInfo = l.subtopicsCount > 0 ? `, ${l.subtopicsCount} subtopics` : '';
          return `  - ${l.title}: ${l.progress}% class progress, ${l.performanceLevel}${subtopicsInfo}`;
        }).join('\n');
        systemContext += `\n\nLessons with Progress:\n${lessonsList}`;
      }
      
      if (pageContext?.progressSummary) {
        systemContext += `\n\nLesson Performance Summary:
- Excellent (≥90%): ${pageContext.progressSummary.excellent} lessons
- Good (75-89%): ${pageContext.progressSummary.good} lessons
- Fair (50-74%): ${pageContext.progressSummary.fair} lessons
- Needs Help (<50%): ${pageContext.progressSummary.needsHelp} lessons`;
      }
      break;

    case 'reports':
      systemContext += `\n- The teacher is viewing the Reports page
- This page shows detailed analytics including lesson completion summaries and assessment scores
- Help interpret report data, generate insights, and provide recommendations`;
      
      if (pageContext?.overallStats) {
        systemContext += `\n\nOverall Statistics:
- Total Lessons: ${pageContext.overallStats.totalLessons}
- Active Students: ${pageContext.overallStats.activeStudents}/${pageContext.overallStats.totalStudents}
- Completed Lessons: ${pageContext.overallStats.completedLessons}
- In Progress Lessons: ${pageContext.overallStats.inProgressLessons}
- Average Completion: ${pageContext.overallStats.avgCompletion}%
- Average Assessment Score: ${pageContext.overallStats.overallAvgScore}%
- Total Assessments: ${pageContext.overallStats.totalAssessments}`;
      }
      
      if (pageContext?.lessonCompletionData && pageContext.lessonCompletionData.length > 0) {
        systemContext += `\n\nALL Lesson Completion Data (${pageContext.lessonCompletionData.length} lessons):`;
        pageContext.lessonCompletionData.forEach((l: any) => {
          systemContext += `\n  - ${l.title}: ${l.avgProgress}% average progress, ${l.completed} completed, ${l.inProgress} in progress, ${l.notStarted} not started`;
        });
      }
      
      if (pageContext?.assessmentScoresData && pageContext.assessmentScoresData.length > 0) {
        systemContext += `\n\nAssessment Performance Summary (${pageContext.assessmentScoresData.length} assessments):`;
        pageContext.assessmentScoresData.forEach((a: any) => {
          systemContext += `\n  - ${a.title}: Avg ${a.avgScore}%, Highest ${a.highestScore}%, Lowest ${a.lowestScore}%, Pass Rate ${a.passRate}%, ${a.totalAttempts} attempts`;
        });
      }
      
      if (pageContext?.aiInsights && pageContext.aiInsights.length > 0) {
        const insights = pageContext.aiInsights.map((i: any) => i.text).join('\n  - ');
        systemContext += `\n\nAI-Generated Insights:\n  - ${insights}`;
      }
      
      // Enhanced: Add detailed student-level data for accurate AI responses
      if (pageContext?.detailedStudentData && pageContext.detailedStudentData.length > 0) {
        systemContext += `\n\nDETAILED STUDENT DATA (use this for specific student questions):`;
        
        pageContext.detailedStudentData.forEach((student: any) => {
          systemContext += `\n\n${student.name}:`;
          systemContext += `\n  Summary: ${student.totalLessonsCompleted} lessons completed, ${student.totalAssessmentsTaken} assessments taken, ${student.averageAssessmentScore}% avg score`;
          
          // Lesson Progress
          if (student.lessonProgress && student.lessonProgress.length > 0) {
            systemContext += `\n  Lesson Progress:`;
            student.lessonProgress.forEach((lesson: any) => {
              systemContext += `\n    - ${lesson.lessonTitle}: ${lesson.status} (${lesson.progress}%)`;
            });
          }
          
          // Assessment Scores
          if (student.assessments && student.assessments.length > 0) {
            systemContext += `\n  Assessment Scores:`;
            student.assessments.forEach((assessment: any) => {
              systemContext += `\n    - ${assessment.assessmentName} (${assessment.lessonTitle}): ${assessment.score}% ${assessment.passed ? '✓ Passed' : '✗ Failed'}`;
            });
          } else {
            systemContext += `\n  Assessment Scores: No assessments taken yet`;
          }
        });
      }
      break;

    default:
      systemContext += `\n- General dashboard context`;
  }

  const fullPrompt = `${systemContext}

Teacher's Question: ${userQuestion}

Please provide a helpful, actionable response focused on the teacher's question. Use the context provided to give specific insights when relevant. Keep your response concise and practical.`;

  return fullPrompt;
}