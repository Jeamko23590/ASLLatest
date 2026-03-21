// Test Flutter Backend Connection
// Run this with: flutter run -t TEST_FLUTTER_BACKEND.dart

import 'package:flutter/material.dart';
import 'package:senyamatika_math_app/backend/services/api_service.dart';

void main() {
  runApp(const BackendTestApp());
}

class BackendTestApp extends StatelessWidget {
  const BackendTestApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Backend Connection Test',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const TestScreen(),
    );
  }
}

class TestScreen extends StatefulWidget {
  const TestScreen({super.key});

  @override
  State<TestScreen> createState() => _TestScreenState();
}

class _TestScreenState extends State<TestScreen> {
  String _status = 'Not tested';
  bool _isLoading = false;
  final List<String> _testResults = [];

  // Use a fixed test student ID that exists in your backend
  static const String _testStudentId = 'test_student_001';

  Future<void> _runTests() async {
    setState(() {
      _isLoading = true;
      _testResults.clear();
      _status = 'Running tests...';
    });

    // Test 1: Health Check
    _addResult('🔍 Testing health endpoint...');
    final healthOk = await ApiService.checkHealth();
    if (healthOk) {
      _addResult('✅ Health check passed');
    } else {
      _addResult('❌ Health check failed - Is backend running?');
      _addResult('   URL: ${ApiService.baseUrl}');
      setState(() {
        _isLoading = false;
        _status = 'Tests failed - Backend not reachable';
      });
      return;
    }

    // Test 2: Register (using new register method)
    _addResult('🔍 Testing registration...');
    final registerResult = await ApiService.register(
      email: 'test${DateTime.now().millisecondsSinceEpoch}@gmail.com',
      password: 'test123',
      name: 'Test User',
      school: 'Test School',
      section: 'Grade 7',
    );

    if (registerResult['success'] == true) {
      _addResult('✅ Registration successful');
      final token = registerResult['data']?['token'];
      if (token != null) {
        _addResult('   Token: ${token.toString().substring(0, 20)}...');
        ApiService.setToken(token);
      }
    } else {
      _addResult('⚠️ Registration: ${registerResult['error']}');
      _addResult('   (May already exist — continuing tests)');
    }

    // Test 3: Login (replaces getUserProfile)
    _addResult('🔍 Testing login...');
    final loginResult = await ApiService.login(
      email: 'testuser@gmail.com',
      password: 'test123',
    );
    if (loginResult['success'] == true) {
      _addResult('✅ Login successful');
      _addResult('   User: ${loginResult['data']?['user']?['name'] ?? 'N/A'}');
    } else {
      _addResult('⚠️ Login: ${loginResult['error']}');
    }

    // Test 4: Get Student (replaces saveProgress for student-based flow)
    _addResult('🔍 Testing get student by ID...');
    ApiService.setStudentId(_testStudentId);
    final studentResult = await ApiService.getStudent(_testStudentId);
    if (studentResult['success'] == true) {
      _addResult('✅ Get student successful');
      _addResult('   Student: ${studentResult['data']?['name'] ?? 'N/A'}');
    } else {
      _addResult('⚠️ Get student: ${studentResult['error']}');
    }

    // Test 5: Record Progress (replaces saveProgress)
    _addResult('🔍 Testing record progress...');
    final progressResult = await ApiService.recordProgress(
      studentId: _testStudentId,
      lessonId: 'lesson_1',
      subtopicId: 'subtopic_lesson_1_1',
      completed: true,
    );
    if (progressResult['success'] == true) {
      _addResult('✅ Record progress successful');
    } else {
      _addResult('⚠️ Record progress: ${progressResult['error']}');
    }

    // Test 6: Get Progress (using new getProgress method)
    _addResult('🔍 Testing get progress...');
    final getProgressResult = await ApiService.getProgress();
    if (getProgressResult['success'] == true) {
      _addResult('✅ Get progress successful');
      final data = getProgressResult['data'];
      if (data is List) {
        _addResult('   Found ${data.length} progress items');
      } else {
        _addResult('   Data received');
      }
    } else {
      _addResult('⚠️ Get progress: ${getProgressResult['error']}');
    }

    // Test 7: Record Assessment Score
    _addResult('🔍 Testing record assessment score...');
    final scoreResult = await ApiService.recordAssessmentScore(
      studentId: _testStudentId,
      assessmentId: 'assessment_lesson_1',
      score: 8,
      maxScore: 10,
    );
    if (scoreResult['success'] == true) {
      _addResult('✅ Record assessment score successful');
    } else {
      _addResult('⚠️ Record assessment: ${scoreResult['error']}');
    }

    // Test 8: Get All Lessons
    _addResult('🔍 Testing get lessons...');
    final lessonsResult = await ApiService.getLessons();
    if (lessonsResult['success'] == true) {
      _addResult('✅ Get lessons successful');
      final data = lessonsResult['data'];
      if (data is List) {
        _addResult('   Found ${data.length} lessons');
      }
    } else {
      _addResult('⚠️ Get lessons: ${lessonsResult['error']}');
    }

    setState(() {
      _isLoading = false;
      _status = 'All tests completed!';
    });
  }

  void _addResult(String result) {
    setState(() {
      _testResults.add(result);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Backend Connection Test'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Backend URL:',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      ApiService.baseUrl,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        color: Colors.blue,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Status: $_status',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isLoading ? null : _runTests,
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Run Tests'),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Card(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _testResults.length,
                  itemBuilder: (context, index) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Text(
                        _testResults[index],
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 12,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}