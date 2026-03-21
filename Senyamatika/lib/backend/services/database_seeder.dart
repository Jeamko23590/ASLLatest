import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'local_storage_service.dart';
import 'local_auth_service.dart';
import '../models/progress_model.dart';
import '../models/quiz_model.dart';

/// Database seeder - NO LONGER CREATES MOCK DATA
/// The app now uses real backend data via API
/// Students should use their real student ID provided by their teacher
class DatabaseSeeder {
  final LocalStorageService _storage = LocalStorageService();
  final LocalAuthService _auth = LocalAuthService();

  /// Check if database has been initialized
  Future<bool> isInitialized() async {
    final box = Hive.box('settings');
    return box.get('database_initialized', defaultValue: false);
  }

  /// Mark database as initialized
  Future<void> _markAsInitialized() async {
    final box = Hive.box('settings');
    await box.put('database_initialized', true);
  }

  /// Initialize the database (no mock data)
  Future<void> seedDatabase() async {
    try {
      // Check if already initialized
      if (await isInitialized()) {
        debugPrint('✅ Database already initialized');
        return;
      }

      debugPrint('🌱 Initializing database...');

      // Just mark as initialized - no mock data
      await _markAsInitialized();

      debugPrint('✅ Database initialized successfully!');
      debugPrint('');
      debugPrint('═══════════════════════════════════════════════════');
      debugPrint('📋 STUDENT LOGIN INSTRUCTIONS:');
      debugPrint('═══════════════════════════════════════════════════');
      debugPrint('');
      debugPrint('👤 STUDENTS:');
      debugPrint('   Use your Student ID provided by your teacher');
      debugPrint('   No password required for mobile app');
      debugPrint('   Your progress will sync with the backend server');
      debugPrint('');
      debugPrint('📡 BACKEND CONNECTION:');
      debugPrint('   The app will automatically connect to the backend');
      debugPrint('   Lessons and progress are loaded from the server');
      debugPrint('   Offline mode available with cached data');
      debugPrint('');
      debugPrint('═══════════════════════════════════════════════════');
    } catch (e) {
      debugPrint('❌ Error initializing database: $e');
    }
  }

  /// Reset database (for testing)
  Future<void> resetDatabase() async {
    await _storage.clearAllData();
    debugPrint('🗑️ Database reset complete');
  }
}
