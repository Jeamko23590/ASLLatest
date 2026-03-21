// TEST_FLUTTER_BACKEND Connection
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

  // ⚠️ Palitan ito ng isang valid na Student ID na nasa iyong database
  static const String _testStudentId = 'STU-001';

  Future<void> _runTests() async {
    setState(() {
      _isLoading = true;
      _testResults.clear();
      _status = 'Running tests...';
    });

    // Test 1: Health Check
    _addResult('🔍 Testing health endpoint...');
    _addResult('   URL: ${ApiService.baseUrl}');
    final healthOk = await ApiService.checkHealth();
    if (healthOk) {
      _addResult('✅ Health check passed');
    } else {
      _addResult('❌ Health check failed - Is backend running on ${ApiService.baseUrl}?');
      setState(() {
        _isLoading = false;
        _status = 'Tests failed';
      });
      return;
    }

    // Test 2: Verify Student ID
    _addResult('');
    _addResult('🔍 Testing verifyStudentId("$_testStudentId")...');
    final verifyResult = await ApiService.verifyStudentId(_testStudentId);
    if (verifyResult['success']) {
      _addResult('✅ Student ID verified');
      final student = verifyResult['data'];
      _addResult('   Name: ${student['name'] ?? 'N/A'}');
      // Save student ID for next tests
      ApiService.setStudentId(_testStudentId);
    } else {
      _addResult('❌ Verify failed: ${verifyResult['error']}');
      _addResult('   ⚠️  Make sure "$_testStudentId" exists in your database');
    }

    // Test 3: Get Lessons
    _addResult('');
    _addResult('🔍 Testing getLessons()...');
    final lessonsResult = await ApiService.getLessons();
    if (lessonsResult['success']) {
      _addResult('✅ Get lessons successful');
      final lessons = lessonsResult['data'];
      final count = lessons is List ? lessons.length : '?';
      _addResult('   Found $count lessons');
    } else {
      _addResult('❌ Get lessons failed: ${lessonsResult['error']}');
    }

    // Test 4: Get Student Progress
    _addResult('');
    _addResult('🔍 Testing getStudentProgress("$_testStudentId")...');
    final progressResult = await ApiService.getStudentProgress(_testStudentId);
    if (progressResult['success']) {
      _addResult('✅ Get student progress successful');
    } else {
      _addResult('❌ Get progress failed: ${progressResult['error']}');
    }

    // Test 5: Record Progress
    _addResult('');
    _addResult('🔍 Testing recordProgress()...');
    final recordResult = await ApiService.recordProgress(
      studentId: _testStudentId,
      lessonId: 'lesson_1',
      subtopicId: 'subtopic_1',
      completed: true,
    );
    if (recordResult['success']) {
      _addResult('✅ Record progress successful');
    } else {
      _addResult('❌ Record progress failed: ${recordResult['error']}');
    }

    // Test 6: Record Assessment Score
    _addResult('');
    _addResult('🔍 Testing recordAssessmentScore()...');
    final scoreResult = await ApiService.recordAssessmentScore(
      studentId: _testStudentId,
      assessmentId: 'assessment_1',
      score: 8,
      maxScore: 10,
    );
    if (scoreResult['success']) {
      _addResult('✅ Record assessment score successful');
    } else {
      _addResult('❌ Record score failed: ${scoreResult['error']}');
    }

    // Test 7: Log Engagement
    _addResult('');
    _addResult('🔍 Testing logEngagement()...');
    final engagementResult = await ApiService.logEngagement(
      studentId: _testStudentId,
      sessionDuration: 120,
      lessonsAccessed: 2,
      activityType: 'lesson',
    );
    if (engagementResult['success']) {
      _addResult('✅ Log engagement successful');
    } else {
      _addResult('❌ Log engagement failed: ${engagementResult['error']}');
    }

    setState(() {
      _isLoading = false;
      _status = 'Tests completed!';
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
                    const SizedBox(height: 8),
                    Text(
                      'Test Student ID: $_testStudentId',
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        color: Colors.orange,
                      ),
                    ),
                    const SizedBox(height: 8),
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
                    final text = _testResults[index];
                    Color color = Colors.black87;
                    if (text.contains('✅')) color = Colors.green.shade700;
                    if (text.contains('❌')) color = Colors.red.shade700;
                    if (text.contains('⚠️')) color = Colors.orange.shade700;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Text(
                        text,
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 12,
                          color: color,
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