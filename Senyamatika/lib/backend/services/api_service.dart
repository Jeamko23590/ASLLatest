import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';

class ApiService {
  // Your WiFi IP address for physical device testing
  static const String _localIP = '192.168.1.59';
  
  // Base URL configuration
  static String get baseUrl {
    // For APK release on physical device - use your WiFi IP
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

  // Get headers with authentication
  static Map<String, String> _getHeaders() {
    final headers = {
      'Content-Type': 'application/json',
    };
    
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    
    return headers;
  }

  // ============ AUTH ENDPOINTS ============

  /// Register new user
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
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
          'name': name,
          'school': school,
          'section': section,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        _token = data['token'];
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Registration failed'};
      }
    } catch (e) {
      debugPrint('Register error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Login user
  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        _token = data['token'];
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Login failed'};
      }
    } catch (e) {
      debugPrint('Login error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Verify token
  static Future<Map<String, dynamic>> verifyToken() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/auth/verify'),
        headers: _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['valid'] == true) {
        return {'success': true, 'data': data};
      } else {
        _token = null;
        return {'success': false, 'error': 'Invalid token'};
      }
    } catch (e) {
      debugPrint('Verify token error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // ============ USER ENDPOINTS ============

  /// Get user profile
  static Future<Map<String, dynamic>> getUserProfile() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/users/profile'),
        headers: _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to get profile'};
      }
    } catch (e) {
      debugPrint('Get profile error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Update user profile
  static Future<Map<String, dynamic>> updateUserProfile({
    String? name,
    String? school,
    String? section,
  }) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/users/profile'),
        headers: _getHeaders(),
        body: jsonEncode({
          'name': name,
          'school': school,
          'section': section,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to update profile'};
      }
    } catch (e) {
      debugPrint('Update profile error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Get user statistics
  static Future<Map<String, dynamic>> getUserStats() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/users/stats'),
        headers: _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to get stats'};
      }
    } catch (e) {
      debugPrint('Get stats error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // ============ PROGRESS ENDPOINTS ============

  /// Get all progress
  static Future<Map<String, dynamic>> getProgress() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/progress'),
        headers: _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to get progress'};
      }
    } catch (e) {
      debugPrint('Get progress error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Get progress for specific topic
  static Future<Map<String, dynamic>> getTopicProgress(String topic) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/progress/topic/$topic'),
        headers: _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to get topic progress'};
      }
    } catch (e) {
      debugPrint('Get topic progress error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Save progress
  static Future<Map<String, dynamic>> saveProgress({
    required String topic,
    String? lessonId,
    int? score,
    int? maxScore,
    bool? completed,
    int? timeSpent,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/progress/save'),
        headers: _getHeaders(),
        body: jsonEncode({
          'topic': topic,
          'lessonId': lessonId,
          'score': score,
          'maxScore': maxScore,
          'completed': completed,
          'timeSpent': timeSpent,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to save progress'};
      }
    } catch (e) {
      debugPrint('Save progress error: $e');
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Sync multiple progress items
  static Future<Map<String, dynamic>> syncProgress(List<Map<String, dynamic>> progressItems) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/progress/sync'),
        headers: _getHeaders(),
        body: jsonEncode({
          'progressItems': progressItems,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to sync progress'};
      }
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
