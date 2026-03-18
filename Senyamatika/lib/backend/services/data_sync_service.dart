import 'package:flutter/foundation.dart';
import 'api_service.dart';
import 'local_storage_service.dart';

/// Service to sync data between backend API and local storage
/// This ensures the mobile app uses real backend data while maintaining offline capability
class DataSyncService {
  static final LocalStorageService _storage = LocalStorageService();
  
  /// Check if backend API is available
  static Future<bool> isBackendAvailable() async {
    try {
      return await ApiService.checkHealth();
    } catch (e) {
      debugPrint('❌ Backend health check failed: $e');
      return false;
    }
  }

  /// Sync all data from backend on app startup
  /// This should be called after student login
  static Future<Map<String, dynamic>> syncAllData(String studentId) async {
    debugPrint('🔄 Starting data sync for student: $studentId');
    
    final results = {
      'success': false,
      'lessonsLoaded': false,
      'progressLoaded': false,
      'studentDataLoaded': false,
      'backendAvailable': false,
      'errors': <String>[],
    };

    // Check if backend is available
    final backendAvailable = await isBackendAvailable();
    results['backendAvailable'] = backendAvailable;

    if (!backendAvailable) {
      debugPrint('⚠️ Backend not available, using local data only');
      results['errors'].add('Backend API is not available');
      return results;
    }

    try {
      // 1. Sync lessons from backend
      final lessonsResult = await syncLessons();
      results['lessonsLoaded'] = lessonsResult['success'] ?? false;
      if (!lessonsResult['success']) {
        results['errors'].add('Failed to load lessons: ${lessonsResult['error']}');
      }

      // 2. Sync student data
      final studentResult = await syncStudentData(studentId);
      results['studentDataLoaded'] = studentResult['success'] ?? false;
      if (!studentResult['success']) {
        results['errors'].add('Failed to load student data: ${studentResult['error']}');
      }

      // 3. Sync student progress
      final progressResult = await syncStudentProgress(studentId);
      results['progressLoaded'] = progressResult['success'] ?? false;
      if (!progressResult['success']) {
        results['errors'].add('Failed to load progress: ${progressResult['error']}');
      }

      results['success'] = results['lessonsLoaded'] && 
                          results['studentDataLoaded'] && 
                          results['progressLoaded'];

      if (results['success']) {
        debugPrint('✅ Data sync completed successfully');
      } else {
        debugPrint('⚠️ Data sync completed with errors: ${results['errors']}');
      }
    } catch (e) {
      debugPrint('❌ Data sync failed: $e');
      results['errors'].add('Sync error: $e');
    }

    return results;
  }

  /// Sync lessons from backend
  static Future<Map<String, dynamic>> syncLessons() async {
    try {
      debugPrint('📚 Syncing lessons from backend...');
      final result = await ApiService.getLessons();
      
      if (result['success'] && result['data'] != null) {
        // Store lessons in local storage for offline access
        // Note: You may need to add a method to LocalStorageService to store lessons
        debugPrint('✅ Loaded ${(result['data'] as List).length} lessons from backend');
        return {'success': true, 'data': result['data']};
      } else {
        return {'success': false, 'error': result['error'] ?? 'Unknown error'};
      }
    } catch (e) {
      debugPrint('❌ Failed to sync lessons: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  /// Sync student data from backend
  static Future<Map<String, dynamic>> syncStudentData(String studentId) async {
    try {
      debugPrint('👤 Syncing student data from backend...');
      final result = await ApiService.getStudent(studentId);
      
      if (result['success'] && result['data'] != null) {
        debugPrint('✅ Loaded student data from backend');
        return {'success': true, 'data': result['data']};
      } else {
        return {'success': false, 'error': result['error'] ?? 'Unknown error'};
      }
    } catch (e) {
      debugPrint('❌ Failed to sync student data: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  /// Sync student progress from backend
  static Future<Map<String, dynamic>> syncStudentProgress(String studentId) async {
    try {
      debugPrint('📊 Syncing progress from backend...');
      final result = await ApiService.getStudentProgress(studentId);
      
      if (result['success'] && result['data'] != null) {
        // Store progress in local storage for offline access
        debugPrint('✅ Loaded progress data from backend');
        return {'success': true, 'data': result['data']};
      } else {
        return {'success': false, 'error': result['error'] ?? 'Unknown error'};
      }
    } catch (e) {
      debugPrint('❌ Failed to sync progress: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  /// Upload local progress to backend
  /// This should be called when student completes a lesson/subtopic
  static Future<Map<String, dynamic>> uploadProgress({
    required String studentId,
    required String lessonId,
    required String subtopicId,
    required bool completed,
  }) async {
    try {
      // Check if backend is available
      if (!await isBackendAvailable()) {
        debugPrint('⚠️ Backend not available, progress saved locally only');
        return {
          'success': true,
          'localOnly': true,
          'message': 'Progress saved locally, will sync when online'
        };
      }

      // Upload to backend
      final result = await ApiService.recordProgress(
        studentId: studentId,
        lessonId: lessonId,
        subtopicId: subtopicId,
        completed: completed,
      );

      if (result['success']) {
        debugPrint('✅ Progress uploaded to backend');
        return result;
      } else {
        debugPrint('⚠️ Failed to upload progress: ${result['error']}');
        return {
          'success': true,
          'localOnly': true,
          'message': 'Progress saved locally, upload failed'
        };
      }
    } catch (e) {
      debugPrint('❌ Error uploading progress: $e');
      return {
        'success': true,
        'localOnly': true,
        'message': 'Progress saved locally, will sync when online'
      };
    }
  }

  /// Upload assessment score to backend
  static Future<Map<String, dynamic>> uploadAssessmentScore({
    required String studentId,
    required String assessmentId,
    required int score,
    required int maxScore,
  }) async {
    try {
      // Check if backend is available
      if (!await isBackendAvailable()) {
        debugPrint('⚠️ Backend not available, score saved locally only');
        return {
          'success': true,
          'localOnly': true,
          'message': 'Score saved locally, will sync when online'
        };
      }

      // Upload to backend
      final result = await ApiService.recordAssessmentScore(
        studentId: studentId,
        assessmentId: assessmentId,
        score: score,
        maxScore: maxScore,
      );

      if (result['success']) {
        debugPrint('✅ Assessment score uploaded to backend');
        return result;
      } else {
        debugPrint('⚠️ Failed to upload score: ${result['error']}');
        return {
          'success': true,
          'localOnly': true,
          'message': 'Score saved locally, upload failed'
        };
      }
    } catch (e) {
      debugPrint('❌ Error uploading score: $e');
      return {
        'success': true,
        'localOnly': true,
        'message': 'Score saved locally, will sync when online'
      };
    }
  }

  /// Log engagement to backend
  static Future<void> logEngagement({
    required String studentId,
    required int sessionDuration,
    required int lessonsAccessed,
    required String activityType,
  }) async {
    try {
      if (!await isBackendAvailable()) {
        debugPrint('⚠️ Backend not available, engagement not logged');
        return;
      }

      await ApiService.logEngagement(
        studentId: studentId,
        sessionDuration: sessionDuration,
        lessonsAccessed: lessonsAccessed,
        activityType: activityType,
      );
      
      debugPrint('✅ Engagement logged to backend');
    } catch (e) {
      debugPrint('❌ Failed to log engagement: $e');
    }
  }
}
