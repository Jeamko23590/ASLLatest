import '../models/user_model.dart';
import '../models/progress_model.dart';
import '../models/quiz_model.dart';
import 'local_storage_service.dart';
import 'local_auth_service.dart';

/// Service to generate mock data for testing
class MockDataService {
  final LocalStorageService _storage = LocalStorageService();
  final LocalAuthService _auth = LocalAuthService();

  /// Generate all mock data
  Future<void> generateAllMockData() async {
    print('🎭 Generating mock data...');
    
    await generateMockUsers();
    await generateMockProgress();
    await generateMockQuizAttempts();
    
    print('✅ Mock data generated successfully!');
  }

  /// Generate mock users
  Future<List<UserModel>> generateMockUsers() async {
    final users = <UserModel>[];

    // User 1: Student
    final user1 = await _auth.registerWithEmail(
      email: 'student@test.com',
      password: 'password123',
      name: 'Maria Santos',
      school: 'Bajet-Castillo High School',
      section: 'Grade 7-A',
    );
    if (user1 != null) users.add(user1);

    // User 2: Another student
    final user2 = await _auth.registerWithEmail(
      email: 'juan@test.com',
      password: 'password123',
      name: 'Juan Dela Cruz',
      school: 'Dampol 2nd National High School',
      section: 'Grade 8-B',
    );
    if (user2 != null) users.add(user2);

    // User 3: Test user
    final user3 = await _auth.registerWithEmail(
      email: 'test@example.com',
      password: 'Test123!',
      name: 'Test User',
      school: 'Test School',
      section: 'Grade 7-A',
    );
    if (user3 != null) users.add(user3);

    print('✅ Generated ${users.length} mock users');
    return users;
  }

  /// Generate mock progress data
  Future<void> generateMockProgress() async {
    final userId = _storage.getCurrentUserId();
    if (userId == null) {
      print('⚠️ No current user, skipping progress generation');
      return;
    }

    final topics = [
      {'id': 'fractions', 'name': 'Fractions', 'completion': 75.0, 'time': 45},
      {'id': 'fundamental_operations', 'name': 'Fundamental Operations', 'completion': 100.0, 'time': 60},
      {'id': 'number_values', 'name': 'Number Values', 'completion': 50.0, 'time': 30},
      {'id': 'decimal_numbers', 'name': 'Decimal Numbers', 'completion': 90.0, 'time': 55},
      {'id': 'percentage', 'name': 'Percentage', 'completion': 25.0, 'time': 15},
      {'id': 'mensuration', 'name': 'Mensuration', 'completion': 0.0, 'time': 0},
    ];

    for (var topic in topics) {
      final progress = ProgressModel(
        userId: userId,
        topicId: topic['id'] as String,
        topicName: topic['name'] as String,
        completionPercentage: (topic['completion'] as num).toDouble(),
        lastAccessed: DateTime.now().subtract(
          Duration(days: topics.indexOf(topic)),
        ),
        timeSpentMinutes: topic['time'] as int,
        isCompleted: (topic['completion'] as num) >= 100.0,
      );

      await _storage.saveProgress(progress);
    }

    print('✅ Generated progress for ${topics.length} topics');
  }

  /// Generate mock quiz attempts
  Future<void> generateMockQuizAttempts() async {
    final userId = _storage.getCurrentUserId();
    if (userId == null) {
      print('⚠️ No current user, skipping quiz generation');
      return;
    }

    final quizzes = [
      // Fractions quizzes
      {
        'quizId': 'fractions_quiz_1',
        'topicId': 'fractions',
        'score': 8,
        'total': 10,
        'time': 120,
        'daysAgo': 5,
      },
      {
        'quizId': 'fractions_quiz_2',
        'topicId': 'fractions',
        'score': 9,
        'total': 10,
        'time': 110,
        'daysAgo': 3,
      },
      {
        'quizId': 'fractions_quiz_3',
        'topicId': 'fractions',
        'score': 10,
        'total': 10,
        'time': 95,
        'daysAgo': 1,
      },
      
      // Fundamental Operations quizzes
      {
        'quizId': 'fundamental_ops_quiz_1',
        'topicId': 'fundamental_operations',
        'score': 7,
        'total': 10,
        'time': 150,
        'daysAgo': 10,
      },
      {
        'quizId': 'fundamental_ops_quiz_2',
        'topicId': 'fundamental_operations',
        'score': 10,
        'total': 10,
        'time': 130,
        'daysAgo': 7,
      },
      
      // Decimal Numbers quizzes
      {
        'quizId': 'decimal_quiz_1',
        'topicId': 'decimal_numbers',
        'score': 6,
        'total': 10,
        'time': 140,
        'daysAgo': 4,
      },
      {
        'quizId': 'decimal_quiz_2',
        'topicId': 'decimal_numbers',
        'score': 9,
        'total': 10,
        'time': 125,
        'daysAgo': 2,
      },
      
      // Number Values quiz
      {
        'quizId': 'number_values_quiz_1',
        'topicId': 'number_values',
        'score': 5,
        'total': 10,
        'time': 160,
        'daysAgo': 6,
      },
      
      // Percentage quiz
      {
        'quizId': 'percentage_quiz_1',
        'topicId': 'percentage',
        'score': 4,
        'total': 10,
        'time': 180,
        'daysAgo': 8,
      },
    ];

    for (var quiz in quizzes) {
      final attempt = QuizAttemptModel(
        userId: userId,
        quizId: quiz['quizId'] as String,
        topicId: quiz['topicId'] as String,
        score: quiz['score'] as int,
        totalQuestions: quiz['total'] as int,
        timestamp: DateTime.now().subtract(
          Duration(days: quiz['daysAgo'] as int),
        ),
        timeSpentSeconds: quiz['time'] as int,
      );

      await _storage.saveQuizAttempt(attempt);
    }

    print('✅ Generated ${quizzes.length} quiz attempts');
  }

  /// Clear all mock data
  Future<void> clearAllData() async {
    await _storage.clearAllData();
    print('🗑️ All mock data cleared');
  }

  /// Get mock data summary
  Future<Map<String, dynamic>> getMockDataSummary() async {
    final userId = _storage.getCurrentUserId();
    if (userId == null) {
      return {
        'hasCurrentUser': false,
        'message': 'No user logged in',
      };
    }

    final user = await _storage.getUser(userId);
    final progress = await _storage.getUserProgress(userId);
    final quizzes = await _storage.getQuizAttempts(userId);
    final stats = await _storage.getUserStatistics(userId);

    return {
      'hasCurrentUser': true,
      'user': {
        'name': user?.name,
        'email': user?.email,
        'school': user?.school,
        'section': user?.section,
      },
      'progressCount': progress.length,
      'quizCount': quizzes.length,
      'statistics': stats,
    };
  }
}
