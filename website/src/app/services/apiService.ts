/// <reference types="vite/client" />

// API Service for connecting to backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

console.log('🔗 API Base URL:', API_BASE_URL);

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // Authentication
  async teacherLogin(employeeId: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/teacher/login', {
      method: 'POST',
      body: JSON.stringify({ employeeId, password }),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('user_role', 'teacher');
    }

    return response;
  }

  async adminLogin(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('user_role', 'admin');
    }

    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
  }

  // Teacher endpoints
  async getTeacherDashboard(teacherId: string) {
    return this.request(`/teachers/${teacherId}/dashboard`);
  }

  async getTeacherStudents(teacherId: string) {
    return this.request(`/teachers/${teacherId}/students`);
  }

  async getStudentProgress(teacherId: string, studentId: string) {
    return this.request(`/teachers/${teacherId}/students/${studentId}/progress`);
  }

  async getTeacherLessons(teacherId: string) {
    return this.request(`/teachers/${teacherId}/lessons`);
  }

  async getTeacherActivity(teacherId: string, limit: number = 20) {
    return this.request(`/teachers/${teacherId}/activity?limit=${limit}`);
  }

  async getTeacherCharts(teacherId: string) {
    return this.request(`/teachers/${teacherId}/charts`);
  }

  async getAdminCharts() {
    return this.request('/admin/charts');
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getTeachers() {
    return this.request('/admin/teachers');
  }

  async createTeacher(data: any) {
    return this.request('/admin/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeacher(id: string, data: any) {
    return this.request(`/admin/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTeacher(id: string) {
    return this.request(`/admin/teachers/${id}`, {
      method: 'DELETE',
    });
  }

  async getSchools() {
    return this.request('/admin/schools');
  }

  async createSchool(data: { name: string; address?: string }) {
    return this.request('/admin/schools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSchool(id: string, data: { name?: string; address?: string }) {
    return this.request(`/admin/schools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSchool(id: string) {
    return this.request(`/admin/schools/${id}`, {
      method: 'DELETE',
    });
  }

  async getClasses() {
    return this.request('/admin/classes');
  }

  // Student endpoints (for APK)
  async recordProgress(data: {
    studentId: string;
    lessonId: string;
    subtopicId: string;
    completed: boolean;
  }) {
    return this.request('/students/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async recordAssessmentScore(data: {
    studentId: string;
    assessmentId: string;
    score: number;
    maxScore: number;
  }) {
    return this.request('/students/assessments/score', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logEngagement(data: {
    studentId: string;
    sessionDuration: number;
    lessonsAccessed: number;
    activityType: 'lesson' | 'assessment' | 'practice';
  }) {
    return this.request('/students/engagement', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStudent(id: string) {
    return this.request(`/students/${id}`);
  }

  async getStudentProgressData(id: string) {
    return this.request(`/students/${id}/progress`);
  }

  // Lesson endpoints
  async getLessons() {
    return this.request('/lessons');
  }

  async getLesson(id: string) {
    return this.request(`/lessons/${id}`);
  }

  async getLessonAssessments(id: string) {
    return this.request(`/lessons/${id}/assessments`);
  }

  // Report endpoints
  getTeacherCSVReportUrl(teacherId: string) {
    return `${API_BASE_URL}/reports/teacher/${teacherId}/csv`;
  }

  getTeacherPDFReportUrl(teacherId: string) {
    return `${API_BASE_URL}/reports/teacher/${teacherId}/pdf`;
  }

  getAdminCSVReportUrl() {
    return `${API_BASE_URL}/reports/admin/csv`;
  }

  async downloadTeacherCSV(teacherId: string) {
    window.open(this.getTeacherCSVReportUrl(teacherId), '_blank');
  }

  async downloadTeacherPDF(teacherId: string) {
    window.open(this.getTeacherPDFReportUrl(teacherId), '_blank');
  }

  async downloadAdminCSV() {
    window.open(this.getAdminCSVReportUrl(), '_blank');
  }
}

export const apiService = new ApiService();
export default apiService;