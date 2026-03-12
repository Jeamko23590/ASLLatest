import 'package:hive_flutter/hive_flutter.dart';
import '../models/user_model.dart';
import '../models/progress_model.dart';
import '../models/quiz_model.dart';

/// Local database service using Hive
/// This replaces Firebase Storage for offline/local development
class LocalStorageService {
  static const String _userBox = 'users';
  static const String _progressBox = 'progress';
  static const String _quizBox = 'quiz_attempts';
  static const String _currentUserKey = 'current_user_id';

  /// Initialize Hive database
  static Future<void> initialize() async {
    await Hive.initFlutter();
    
    // Open boxes
    await Hive.openBox(_userBox);
    await Hive.openBox(_progressBox);
    await Hive.openBox(_quizBox);
    await Hive.openBox('settings');
  }

  // ============ USER OPERATIONS ============

  /// Save user data
  Future<void> saveUser(UserModel user) async {
    final box = Hive.box(_userBox);
    await box.put(user.uid, {
      'uid': user.uid,
      'name': user.name,
      'email': user.email,
      'school': user.school,
      'section': user.section,
      'createdAt': user.createdAt.toIso8601String(),
      'lastLogin': user.lastLogin?.toIso8601String(),
    });
  }

  /// Get user by ID
  Future<UserModel?> getUser(String uid) async {
    final box = Hive.box(_userBox);
    final data = box.get(uid);
    
    if (data == null) return null;
    
    return UserModel(
      uid: data['uid'],
      name: data['name'],
      email: data['email'],
      school: data['school'],
      section: data['section'],
      createdAt: DateTime.parse(data['createdAt']),
      lastLogin: data['lastLogin'] != null 
          ? DateTime.parse(data['lastLogin']) 
          : null,
    );
  }

  /// Get user by email
  Future<UserModel?> getUserByEmail(String email) async {
    final box = Hive.box(_userBox);
    
    for (var key in box.keys) {
      final data = box.get(key);
      if (data['email'] == email) {
        return UserModel(
          uid: data['uid'],
          name: data['name'],
          email: data['email'],
          school: data['school'],
          section: data['section'],
          createdAt: DateTime.parse(data['createdAt']),
          lastLogin: data['lastLogin'] != null 
              ? DateTime.parse(data['lastLogin']) 
              : null,
        );
      }
    }
    return null;
  }

  /// Update user
  Future<void> updateUser(String uid, Map<String, dynamic> updates) async {
    final box = Hive.box(_userBox);
    final data = box.get(uid);
    
    if (data != null) {
      // Convert to regular Map to avoid IdentityMap type issues
      final Map<String, dynamic> userData = Map<String, dynamic>.from(data);
      userData.addAll(updates);
      await box.put(uid, userData);
    }
  }

  /// Delete user
  Future<void> deleteUser(String uid) async {
    final box = Hive.box(_userBox);
    await box.delete(uid);
    
    // Delete user's progress
    final progressBox = Hive.box(_progressBox);
    final keysToDelete = <String>[];
    for (var key in progressBox.keys) {
      if (key.toString().startsWith('${uid}_')) {
        keysToDelete.add(key);
      }
    }
    for (var key in keysToDelete) {
      await progressBox.delete(key);
    }
    
    // Delete user's quiz attempts
    final quizBox = Hive.box(_quizBox);
    final quizKeysToDelete = <String>[];
    for (var key in quizBox.keys) {
      final data = quizBox.get(key);
      if (data['userId'] == uid) {
        quizKeysToDelete.add(key);
      }
    }
    for (var key in quizKeysToDelete) {
      await quizBox.delete(key);
    }
  }

  /// Set current user
  Future<void> setCurrentUser(String uid) async {
    final box = Hive.box('settings');
    await box.put(_currentUserKey, uid);
  }

  /// Get current user ID
  String? getCurrentUserId() {
    final box = Hive.box('settings');
    return box.get(_currentUserKey);
  }

  /// Clear current user (logout)
  Future<void> clearCurrentUser() async {
    final box = Hive.box('settings');
    await box.delete(_currentUserKey);
  }

  // ============ PROGRESS OPERATIONS ============

  /// Save progress
  Future<void> saveProgress(ProgressModel progress) async {
    final box = Hive.box(_progressBox);
    final key = '${progress.userId}_${progress.topicId}';
    
    await box.put(key, {
      'userId': progress.userId,
      'topicId': progress.topicId,
      'topicName': progress.topicName,
      'completionPercentage': progress.completionPercentage,
      'lastAccessed': progress.lastAccessed.toIso8601String(),
      'timeSpentMinutes': progress.timeSpentMinutes,
      'isCompleted': progress.isCompleted,
    });
  }

  /// Get progress for a specific topic
  Future<ProgressModel?> getProgress(String userId, String topicId) async {
    final box = Hive.box(_progressBox);
    final key = '${userId}_$topicId';
    final data = box.get(key);
    
    if (data == null) return null;
    
    return ProgressModel(
      userId: data['userId'],
      topicId: data['topicId'],
      topicName: data['topicName'],
      completionPercentage: data['completionPercentage'].toDouble(),
      lastAccessed: DateTime.parse(data['lastAccessed']),
      timeSpentMinutes: data['timeSpentMinutes'],
      isCompleted: data['isCompleted'],
    );
  }

  /// Get all progress for a user
  Future<List<ProgressModel>> getUserProgress(String userId) async {
    final box = Hive.box(_progressBox);
    final progressList = <ProgressModel>[];
    
    for (var key in box.keys) {
      if (key.toString().startsWith('${userId}_')) {
        final data = box.get(key);
        progressList.add(ProgressModel(
          userId: data['userId'],
          topicId: data['topicId'],
          topicName: data['topicName'],
          completionPercentage: data['completionPercentage'].toDouble(),
          lastAccessed: DateTime.parse(data['lastAccessed']),
          timeSpentMinutes: data['timeSpentMinutes'],
          isCompleted: data['isCompleted'],
        ));
      }
    }
    
    // Sort by last accessed
    progressList.sort((a, b) => b.lastAccessed.compareTo(a.lastAccessed));
    return progressList;
  }

  // ============ QUIZ OPERATIONS ============

  /// Save quiz attempt
  Future<void> saveQuizAttempt(QuizAttemptModel attempt) async {
    final box = Hive.box(_quizBox);
    final key = '${attempt.userId}_${attempt.quizId}_${DateTime.now().millisecondsSinceEpoch}';
    
    await box.put(key, {
      'userId': attempt.userId,
      'quizId': attempt.quizId,
      'topicId': attempt.topicId,
      'score': attempt.score,
      'totalQuestions': attempt.totalQuestions,
      'timestamp': attempt.timestamp.toIso8601String(),
      'timeSpentSeconds': attempt.timeSpentSeconds,
    });
  }

  /// Get quiz attempts for a user
  Future<List<QuizAttemptModel>> getQuizAttempts(String userId) async {
    final box = Hive.box(_quizBox);
    final attempts = <QuizAttemptModel>[];
    
    for (var key in box.keys) {
      final data = box.get(key);
      if (data['userId'] == userId) {
        attempts.add(QuizAttemptModel(
          userId: data['userId'],
          quizId: data['quizId'],
          topicId: data['topicId'],
          score: data['score'],
          totalQuestions: data['totalQuestions'],
          timestamp: DateTime.parse(data['timestamp']),
          timeSpentSeconds: data['timeSpentSeconds'],
        ));
      }
    }
    
    // Sort by timestamp
    attempts.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    return attempts;
  }

  /// Get quiz attempts for a specific topic
  Future<List<QuizAttemptModel>> getTopicQuizAttempts(
    String userId,
    String topicId,
  ) async {
    final box = Hive.box(_quizBox);
    final attempts = <QuizAttemptModel>[];
    
    for (var key in box.keys) {
      final data = box.get(key);
      if (data['userId'] == userId && data['topicId'] == topicId) {
        attempts.add(QuizAttemptModel(
          userId: data['userId'],
          quizId: data['quizId'],
          topicId: data['topicId'],
          score: data['score'],
          totalQuestions: data['totalQuestions'],
          timestamp: DateTime.parse(data['timestamp']),
          timeSpentSeconds: data['timeSpentSeconds'],
        ));
      }
    }
    
    attempts.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    return attempts;
  }

  /// Get best quiz score for a topic
  Future<QuizAttemptModel?> getBestQuizScore(
    String userId,
    String topicId,
  ) async {
    final attempts = await getTopicQuizAttempts(userId, topicId);
    
    if (attempts.isEmpty) return null;
    
    attempts.sort((a, b) => b.score.compareTo(a.score));
    return attempts.first;
  }

  // ============ STATISTICS ============

  /// Get user statistics
  Future<Map<String, dynamic>> getUserStatistics(String userId) async {
    final progressList = await getUserProgress(userId);
    final quizAttempts = await getQuizAttempts(userId);

    final totalTopics = progressList.length;
    final completedTopics = progressList.where((p) => p.isCompleted).length;
    final totalTimeSpent = progressList.fold<int>(
      0,
      (sum, p) => sum + p.timeSpentMinutes,
    );
    final totalQuizzes = quizAttempts.length;
    final averageScore = quizAttempts.isEmpty
        ? 0.0
        : quizAttempts.fold<double>(
              0,
              (sum, q) => sum + q.percentage,
            ) / quizAttempts.length;

    return {
      'totalTopics': totalTopics,
      'completedTopics': completedTopics,
      'totalTimeSpentMinutes': totalTimeSpent,
      'totalQuizzes': totalQuizzes,
      'averageScore': averageScore,
    };
  }

  // ============ CREDENTIALS (for local auth) ============

  /// Save user credentials (hashed password)
  Future<void> saveCredentials(String email, String passwordHash) async {
    final box = Hive.box('settings');
    await box.put('cred_$email', passwordHash);
    print('💾 Saved credentials for: $email (hash: ${passwordHash.substring(0, 10)}...)');
  }

  /// Verify credentials
  Future<bool> verifyCredentials(String email, String passwordHash) async {
    final box = Hive.box('settings');
    final stored = box.get('cred_$email');
    print('🔍 Verifying credentials for: $email');
    print('   Provided hash: ${passwordHash.substring(0, 10)}...');
    print('   Stored hash: ${stored != null ? stored.toString().substring(0, 10) : 'null'}...');
    if (stored == null) {
      print('   ❌ No stored credentials found');
      return false;
    }
    final isValid = stored == passwordHash;
    print('   ${isValid ? '✓' : '❌'} Match result: $isValid');
    return isValid;
  }

  /// Clear all data (for testing)
  Future<void> clearAllData() async {
    await Hive.box(_userBox).clear();
    await Hive.box(_progressBox).clear();
    await Hive.box(_quizBox).clear();
    await Hive.box('settings').clear();
  }
}
