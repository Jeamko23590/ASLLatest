import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Basic text test', (WidgetTester tester) async {
    // Build a simple widget for testing
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Center(
            child: Text('Test'),
          ),
        ),
      ),
    );

    // Verify our text appears
    expect(find.text('Test'), findsOneWidget);
  });
}