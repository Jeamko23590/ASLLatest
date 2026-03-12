import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'local_storage_service.dart';
import 'local_auth_service.dart';
import '../models/progress_model.dart';
import '../models/quiz_model.dart';

/// Database seeder - creates default admin and test users
class DatabaseSeeder {
  final LocalStorageService _storage = LocalStorageService();
  final LocalAuthService _auth = LocalAuthService();

  /// Check if database has been seeded
  Future<bool> isSeeded() async {
    final box = Hive.box('settings');
    return box.get('database_seeded', defaultValue: false);
  }

  /// Mark database as seeded
  Future<void> _markAsSeeded() async {
    final box = Hive.box('settings');
    await box.put('database_seeded', true);
  }

  /// Seed the database with default data
  Future<void> seedDatabase() async {
    try {
      // Check if already seeded
      if (await isSeeded()) {
        debugPrint('✅ Database already seeded');
        return;
      }

      debugPrint('🌱 Seeding database with default data...');

      // Create Admin User
      await _createAdminUser();

      // Create Test Users
      await _createTestUsers();

      // Create Sample Progress Data
      await _createSampleProgress();

      // Create Sample Quiz Results
      await _createSampleQuizResults();

      // Mark as seeded
      await _markAsSeeded();

      debugPrint('✅ Database seeded successfully!');
      debugPrint('');
      debugPrint('═══════════════════════════════════════════════════');
      debugPrint('📋 DEFAULT LOGIN CREDENTIALS:');
      debugPrint('═══════════════════════════════════════════════════');
      debugPrint('');
      debugPrint('👤 ADMIN ACCOUNT:');
      debugPrint('   Email: admin@senyamatika.com');
      debugPrint('   Password: Admin123!');
      debugPrint('');
      debugPrint('👤 TEACHER ACCOUNT:');
      debugPrint('   Email: teacher@senyamatika.com');
      debugPrint('   Password: Teacher123!');
      debugPrint('');
      debugPrint('👤 STUDENT ACCOUNTS:');
      debugPrint('   Email: student1@senyamatika.com');
      debugPrint('   Password: Student123!');
      debugPrint('');
      debugPrint('   Email: student2@senyamatika.com');
      debugPrint('   Password: Student123!');
      debugPrint('');
      debugPrint('═══════════════════════════════════════════════════');
    } catch (e) {
      debugPrint('❌ Error seeding database: $e');
    }
  }

  /// Create admin user
  Future<void> _createAdminUser() async {
    try {
      await _auth.registerWithEmail(
        email: 'admin@senyamatika.com',
        password: 'Admin123!',
        name: 'Admin User',
        school: 'SenyaMatika Administration',
        section: 'Admin',
      );
      debugPrint('✓ Admin user created');
    } catch (e) {
      debugPrint('⚠️ Admin user creation failed: $e');
    }
  }

  /// Create test users
  Future<void> _createTestUsers() async {
    // Teacher Account
    try {
      await _auth.registerWithEmail(
        email: 'teacher@senyamatika.com',
        password: 'Teacher123!',
        name: 'Maria Santos',
        school: 'Pulong Buhangin National High School',
        section: 'Grade 7 - Teacher',
      );
      debugPrint('✓ Teacher user created');
    } catch (e) {
      debugPrint('⚠️ Teacher user creation failed: $e');
    }

    // Student 1
    try {
      await _auth.registerWithEmail(
        email: 'student1@senyamatika.com',
        password: 'Student123!',
        name: 'Juan Dela Cruz',
        school: 'Pulong Buhangin National High School',
        section: 'Grade 7-A',
      );
      debugPrint('✓ Student 1 created');
    } catch (e) {
      debugPrint('⚠️ Student 1 creation failed: $e');
    }

    // Student 2
    try {
      await _auth.registerWithEmail(
        email: 'student2@senyamatika.com',
        password: 'Student123!',
        name: 'Maria Clara',
        school: 'Pulong Buhangin National High School',
        section: 'Grade 7-B',
      );
      debugPrint('✓ Student 2 created');
    } catch (e) {
      debugPrint('⚠️ Student 2 creation failed: $e');
    }
  }

  /// Create sample progress data for student1
  Future<void> _createSampleProgress() async {
    try {
      final student1 = await _storage.getUserByEmail('student1@senyamatika.com');
      if (student1 == null) return;

      // Fractions - Completed
      await _storage.saveProgress(ProgressModel(
        userId: student1.uid,
        topicId: 'fractions',
        topicName: 'Fractions',
        completionPercentage: 100.0,
        lastAccessed: DateTime.now().subtract(const Duration(days: 2)),
        timeSpentMinutes: 45,
        isCompleted: true,
      ));

      // Fundamental Operations - In Progress
      await _storage.saveProgress(ProgressModel(
        userId: student1.uid,
        topicId: 'fundamental_operations',
        topicName: 'Fundamental Operations',
        completionPercentage: 65.0,
        lastAccessed: DateTime.now().subtract(const Duration(days: 1)),
        timeSpentMinutes: 30,
        isCompleted: false,
      ));

      // Number Values - Started
      await _storage.saveProgress(ProgressModel(
        userId: student1.uid,
        topicId: 'number_values',
        topicName: 'Number Values',
        completionPercentage: 25.0,
        lastAccessed: DateTime.now(),
        timeSpentMinutes: 15,
        isCompleted: false,
      ));

      debugPrint('✓ Sample progress data created');
    } catch (e) {
      debugPrint('⚠️ Sample progress creation failed: $e');
    }
  }

  /// Create sample quiz results for student1
  Future<void> _createSampleQuizResults() async {
    try {
      final student1 = await _storage.getUserByEmail('student1@senyamatika.com');
      if (student1 == null) return;

      // Fractions Quiz - Excellent
      await _storage.saveQuizAttempt(QuizAttemptModel(
        userId: student1.uid,
        quizId: 'fractions_quiz_1',
        topicId: 'fractions',
        score: 9,
        totalQuestions: 10,
        timestamp: DateTime.now().subtract(const Duration(days: 2)),
        timeSpentSeconds: 180,
      ));

      // Fractions Quiz - Second Attempt
      await _storage.saveQuizAttempt(QuizAttemptModel(
        userId: student1.uid,
        quizId: 'fractions_quiz_1',
        topicId: 'fractions',
        score: 10,
        totalQuestions: 10,
        timestamp: DateTime.now().subtract(const Duration(days: 1)),
        timeSpentSeconds: 150,
      ));

      // Fundamental Operations Quiz - Good
      await _storage.saveQuizAttempt(QuizAttemptModel(
        userId: student1.uid,
        quizId: 'operations_quiz_1',
        topicId: 'fundamental_operations',
        score: 7,
        totalQuestions: 10,
        timestamp: DateTime.now().subtract(const Duration(hours: 12)),
        timeSpentSeconds: 200,
      ));

      debugPrint('✓ Sample quiz results created');
    } catch (e) {
      debugPrint('⚠️ Sample quiz results creation failed: $e');
    }
  }

  /// Reset database (for testing)
  Future<void> resetDatabase() async {
    await _storage.clearAllData();
    debugPrint('🗑️ Database reset complete');
  }
}
