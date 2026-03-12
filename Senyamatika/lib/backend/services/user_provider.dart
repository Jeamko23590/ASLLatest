import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../models/progress_model.dart';
import 'local_auth_service.dart';
import 'local_storage_service.dart';

/// User state management provider
class UserProvider extends ChangeNotifier {
  final LocalAuthService _authService = LocalAuthService();
  final LocalStorageService _storageService = LocalStorageService();

  UserModel? _currentUser;
  List<ProgressModel> _userProgress = [];
  Map<String, dynamic>? _userStatistics;
  bool _isLoading = false;

  UserModel? get currentUser => _currentUser;
  List<ProgressModel> get userProgress => _userProgress;
  Map<String, dynamic>? get userStatistics => _userStatistics;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _currentUser != null;

  /// Initialize user data
  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    try {
      final user = await _authService.getCurrentUser();
      if (user != null) {
        await loadUserData(user.uid);
      }
    } catch (e) {
      debugPrint('Error initializing user: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load user data from local storage
  Future<void> loadUserData(String uid) async {
    try {
      _currentUser = await _storageService.getUser(uid);
      if (_currentUser != null) {
        await loadUserProgress();
        await loadUserStatistics();
      }
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading user data: $e');
    }
  }

  /// Load user progress
  Future<void> loadUserProgress() async {
    if (_currentUser == null) return;

    try {
      _userProgress = await _storageService.getUserProgress(_currentUser!.uid);
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading user progress: $e');
    }
  }

  /// Load user statistics
  Future<void> loadUserStatistics() async {
    if (_currentUser == null) return;

    try {
      _userStatistics = await _storageService.getUserStatistics(_currentUser!.uid);
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading user statistics: $e');
    }
  }

  /// Update user information
  Future<void> updateUserInfo({
    String? name,
    String? school,
    String? section,
  }) async {
    if (_currentUser == null) return;

    try {
      final updates = <String, dynamic>{};
      if (name != null) updates['name'] = name;
      if (school != null) updates['school'] = school;
      if (section != null) updates['section'] = section;

      await _storageService.updateUser(_currentUser!.uid, updates);
      
      _currentUser = _currentUser!.copyWith(
        name: name,
        school: school,
        section: section,
      );
      notifyListeners();
    } catch (e) {
      debugPrint('Error updating user info: $e');
      rethrow;
    }
  }

  /// Save progress
  Future<void> saveProgress(ProgressModel progress) async {
    try {
      await _storageService.saveProgress(progress);
      await loadUserProgress();
      await loadUserStatistics();
    } catch (e) {
      debugPrint('Error saving progress: $e');
      rethrow;
    }
  }

  /// Clear user data (on logout)
  void clearUserData() {
    _currentUser = null;
    _userProgress = [];
    _userStatistics = null;
    notifyListeners();
  }

  /// Sign out
  Future<void> signOut() async {
    try {
      await _authService.signOut();
      clearUserData();
    } catch (e) {
      debugPrint('Error signing out: $e');
      rethrow;
    }
  }
}
