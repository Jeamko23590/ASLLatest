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
      setState(() {
        _isLoading = false;
        _status = 'Tests failed';
      });
      return;
    }

    // Test 2: Register
    _addResult('🔍 Testing registration...');
    final registerResult = await ApiService.register(
      email: 'test${DateTime.now().millisecondsSinceEpoch}@example.com',
      password: 'test123',
      name: 'Test User',
      school: 'Test School',
      section: 'Test Section',
    );

    if (registerResult['success']) {
      _addResult('✅ Registration successful');
      _addResult('   Token: ${registerResult['data']['token'].substring(0, 20)}...');
    } else {
      _addResult('❌ Registration failed: ${registerResult['error']}');
    }

    // Test 3: Get Profile
    _addResult('🔍 Testing get profile...');
    final profileResult = await ApiService.getUserProfile();
    if (profileResult['success']) {
      _addResult('✅ Get profile successful');
      _addResult('   User: ${profileResult['data']['name']}');
    } else {
      _addResult('❌ Get profile failed: ${profileResult['error']}');
    }

    // Test 4: Save Progress
    _addResult('🔍 Testing save progress...');
    final progressResult = await ApiService.saveProgress(
      topic: 'fractions',
      lessonId: 'lesson_1',
      score: 8,
      maxScore: 10,
      completed: true,
      timeSpent: 120,
    );

    if (progressResult['success']) {
      _addResult('✅ Save progress successful');
    } else {
      _addResult('❌ Save progress failed: ${progressResult['error']}');
    }

    // Test 5: Get Progress
    _addResult('🔍 Testing get progress...');
    final getProgressResult = await ApiService.getProgress();
    if (getProgressResult['success']) {
      _addResult('✅ Get progress successful');
      final items = getProgressResult['data'] as List;
      _addResult('   Found ${items.length} progress items');
    } else {
      _addResult('❌ Get progress failed: ${getProgressResult['error']}');
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
