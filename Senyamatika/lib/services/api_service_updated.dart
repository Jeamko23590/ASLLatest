import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ApiService {
  static String? _token;

  static Future<Map<String, String>> _getHeaders() async {
    final headers = {
      'Content-Type': 'application/json',
    };
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  // Register new user
  static Future<Map<String, dynamic>?> register({
    required String email,
    required String password,
    required String name,
    String? school,
    String? section,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/auth/register'),
        headers: await _getHeaders(),
        body: json.encode({
          'email': email,
          'password': password,
          'name': name,
          'school': school,
          'section': section,
        }),
      );

      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        _token = data['token'];
        return data;
      }
      return null;
    } catch (e) {
      print('Error registering: $e');
      return null;
    }
  }

  // Login user
  static Future<Map<String, dynamic>?> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/auth/login'),
        headers: await _getHeaders(),
        body: json.encode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _token = data['token'];
        return data;
      }
      return null;
    } catch (e) {
      print('Error logging in: $e');
      return null;
    }
  }

  // Get user progress
  static Future<List<dynamic>?> getProgress() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/progress'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['progress'];
      }
      return null;
    } catch (e) {
      print('Error fetching progress: $e');
      return null;
    }
  }

  // Get progress for specific topic
  static Future<List<dynamic>?> getTopicProgress(String topic) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/progress/topic/$topic'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['progress'];
      }
      return null;
    } catch (e) {
      print('Error fetching topic progress: $e');
      return null;
    }
  }

  // Save progress
  static Future<bool> saveProgress({
    required String topic,
    String? lessonId,
    int? score,
    int? maxScore,
    bool? completed,
    int? timeSpent,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/progress/save'),
        headers: await _getHeaders(),
        body: json.encode({
          'topic': topic,
          'lessonId': lessonId,
          'score': score,
          'maxScore': maxScore,
          'completed': completed,
          'timeSpent': timeSpent,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error saving progress: $e');
      return false;
    }
  }

  // Sync multiple progress items
  static Future<bool> syncProgress(List<Map<String, dynamic>> progressItems) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/progress/sync'),
        headers: await _getHeaders(),
        body: json.encode({
          'progressItems': progressItems,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error syncing progress: $e');
      return false;
    }
  }

  // Test connection
  static Future<bool> testConnection() async {
    try {
      final baseUrlWithoutApi = ApiConfig.baseUrl.replaceAll('/api', '');
      final response = await http.get(
        Uri.parse('$baseUrlWithoutApi/health'),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Connection test failed: $e');
      return false;
    }
  }

  // Logout
  static void logout() {
    _token = null;
  }
}
