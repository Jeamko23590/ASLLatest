import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';

class ApiService {
  // Your WiFi IP address for physical device testing
  static const String _localIP = '192.168.1.138';
  
  // Base URL configuration
  static String get baseUrl {
    return 'http://$_localIP:3001/api';
  }

  static String? _token;

  // Set authentication token
  static void setToken(String token) {
    _token = token;
  }

  // Get authentication token
  static String? getToken() {
    return _token;
  }

  // Clear token (logout)
  static void clearToken() {
    _token = null;
  }

  // Set student ID (used as authentication)
  static void setStudentId(String studentId) {
    _token = studentId;
  }

  // Get current student ID
  static String? getStudentId() {
    return _token;
  }

  // Clear student ID (logout)
  static void clearStudentId() {
    _token = null;
  }

  // Get headers
  static Map<String, String> _getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  // ============ ADDED: register() - for main.dart compatibility ============
  /// Register a new user (local app uses LocalAuthService, but this provides
  /// backend sync if available)
  static Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String name,
    String? school,
    String? section,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: _getHeaders(),
        body: jsonEncode({
          'email': email,
          'password': password,
          'name': name,
          'school': school,
          'section': section,
        }),
      ).timeout(const Duration(seconds: 8));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {'success': true, 'data': data['data'] ?? data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Registration failed'};
      }
    } catch (e) {
      debugPrint('Register error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // ============ ADDED: login() - for main.dart compatibility ============
  /// Login with email and password
  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: _getHeaders(),
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      ).timeout(const Duration(seconds: 8));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data['data'] ?? data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Login failed'};
      }
    } catch (e) {
      debugPrint('Login error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // ============ ADDED: getProgress() - for main.dart compatibility ============
  /// Get progress for the currently logged-in user
  static Future<Map<String, dynamic>> getProgress() async {
    try {
      final studentId = getStudentId();
      if (studentId == null) {
        return {'success': false, 'error': 'No student ID set'};
      }

      final response = await http.get(
        Uri.parse('$baseUrl/students/$studentId/progress'),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 8));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data['data'] ?? data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to get progress'};
      }
    } catch (e) {
      debugPrint('Get progress error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // ============ AUTH ENDPOINTS ============

  /// Verify student ID exists in the system
  static Future<Map<String, dynamic>> verifyStudentId(String studentId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/students/$studentId'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 8));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'data': data['data']};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Student ID not found'};
      }
    } catch (e) {
      debugPrint('Verify student ID error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // ============ LESSON ENDPOINTS ============

  /// Get all lessons with subtopics
  static Future<Map<String, dynamic>> getLessons() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/lessons'),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 8));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data['data'] ?? data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to get lessons'};
      }
    } catch (e) {
      debugPrint('Get lessons error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Get single lesson by ID
  static Future<Map<String, dynamic>> getLesson(String lessonId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/lessons/$lessonId'),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 8));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data['data'] ?? data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to get lesson'};
      }
    } catch (e) {
      debugPrint('Get lesson error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Get all assessments
  static Future<Map<String, dynamic>> getAllAssessments() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/lessons/assessments/all'),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 8));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data['data'] ?? data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to get assessments'};
      }
    } catch (e) {
      debugPrint('Get assessments error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // ============ STUDENT PROGRESS ENDPOINTS ============

  /// Get student info by ID
  static Future<Map<String, dynamic>> getStudent(String studentId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/students/$studentId'),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 8));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data['data'] ?? data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to get student'};
      }
    } catch (e) {
      debugPrint('Get student error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Get student progress
  static Future<Map<String, dynamic>> getStudentProgress(String studentId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/students/$studentId/progress'),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 8));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data['data'] ?? data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to get progress'};
      }
    } catch (e) {
      debugPrint('Get progress error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Record student progress (subtopic completion)
  static Future<Map<String, dynamic>> recordProgress({
    required String studentId,
    required String lessonId,
    required String subtopicId,
    required bool completed,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/students/progress'),
        headers: _getHeaders(),
        body: jsonEncode({
          'studentId': studentId,
          'lessonId': lessonId,
          'subtopicId': subtopicId,
          'completed': completed,
        }),
      ).timeout(const Duration(seconds: 8));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data['data'] ?? data, 'message': data['message']};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to record progress'};
      }
    } catch (e) {
      debugPrint('Record progress error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Record assessment score
  static Future<Map<String, dynamic>> recordAssessmentScore({
    required String studentId,
    required String assessmentId,
    required int score,
    required int maxScore,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/students/assessments/score'),
        headers: _getHeaders(),
        body: jsonEncode({
          'studentId': studentId,
          'assessmentId': assessmentId,
          'score': score,
          'maxScore': maxScore,
        }),
      ).timeout(const Duration(seconds: 8));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data['data'] ?? data, 'message': data['message']};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to record score'};
      }
    } catch (e) {
      debugPrint('Record assessment score error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Log student engagement
  static Future<Map<String, dynamic>> logEngagement({
    required String studentId,
    required int sessionDuration,
    required int lessonsAccessed,
    required String activityType,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/students/engagement'),
        headers: _getHeaders(),
        body: jsonEncode({
          'studentId': studentId,
          'sessionDuration': sessionDuration,
          'lessonsAccessed': lessonsAccessed,
          'activityType': activityType,
        }),
      ).timeout(const Duration(seconds: 8));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data['data'] ?? data, 'message': data['message']};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to log engagement'};
      }
    } catch (e) {
      debugPrint('Log engagement error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Sync multiple progress items (batch update)
  static Future<Map<String, dynamic>> syncProgress(
      List<Map<String, dynamic>> progressItems) async {
    try {
      int successCount = 0;
      int failCount = 0;
      List<String> errors = [];

      for (var item in progressItems) {
        final result = await recordProgress(
          studentId: item['studentId'],
          lessonId: item['lessonId'],
          subtopicId: item['subtopicId'],
          completed: item['completed'] ?? false,
        );

        if (result['success'] == true) {
          successCount++;
        } else {
          failCount++;
          errors.add(result['error'] ?? 'Unknown error');
        }
      }

      return {
        'success': failCount == 0,
        'data': {
          'synced': successCount,
          'failed': failCount,
          'total': progressItems.length,
        },
        'errors': errors,
      };
    } catch (e) {
      debugPrint('Sync progress error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // ============ HEALTH CHECK ============

  /// Check if API is reachable
  static Future<bool> checkHealth() async {
    try {
      final response = await http.get(
        Uri.parse('${baseUrl.replaceAll('/api', '')}/health'),
      ).timeout(const Duration(seconds: 5));

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Health check error: $e');
      return false;
    }
  }
}