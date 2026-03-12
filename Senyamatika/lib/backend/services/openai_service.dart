import 'dart:convert';
import 'package:http/http.dart' as http;

class OpenAIService {
  static const String _apiKey = 'AIzaSyDLmYsnv7fcLuiCpIm10zugytL4dhhj1n0';
  static const String _apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

  /// Ask Gemini to solve a math equation
  Future<String> solveMathEquation(String question) async {
    try {
      print('🤖 Asking Gemini: $question');

      final response = await http.post(
        Uri.parse('$_apiUrl?key=$_apiKey'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'contents': [
            {
              'parts': [
                {
                  'text': '''You are a math calculator. Solve the equation using proper order of operations (PEMDAS/BODMAS).

CRITICAL: Your response must be EXACTLY in this format:
- For math: "The answer is [number]"
- For non-math: "Sorry, i can only do math equations"

Examples:
"5 + 3" → "The answer is 8"
"12 * 4" → "The answer is 48"
"4 + 10 - 5 * 8" → "The answer is -26" (because 5*8=40, then 4+10-40=-26)
"5 + 10 times 5" → "The answer is 55" (because 10*5=50, then 5+50=55)
"what is a fraction" → "Sorry, i can only do math equations"

Now solve: $question

Remember: Use PEMDAS order (Parentheses, Exponents, Multiplication/Division, Addition/Subtraction)'''
                }
              ]
            }
          ],
          'generationConfig': {
            'temperature': 0.1,
            'maxOutputTokens': 1000,
          }
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('📦 Full response: ${jsonEncode(data)}');
        
        if (data['candidates'] != null && 
            data['candidates'].isNotEmpty) {
          
          final candidate = data['candidates'][0];
          
          // Check finish reason
          if (candidate['finishReason'] != null) {
            print('🏁 Finish reason: ${candidate['finishReason']}');
          }
          
          // Check for safety ratings
          if (candidate['safetyRatings'] != null) {
            print('🛡️ Safety ratings: ${candidate['safetyRatings']}');
          }
          
          if (candidate['content'] != null &&
              candidate['content']['parts'] != null &&
              candidate['content']['parts'].isNotEmpty) {
            
            final answer = candidate['content']['parts'][0]['text'].toString().trim();
            print('✅ Gemini response: $answer');
            
            // If response is incomplete, return error
            if (answer.isEmpty || answer == 'The answer is' || answer == 'Sorry, currently i') {
              print('⚠️ Incomplete response detected');
              return 'Sorry, I got an incomplete response. Please try again.';
            }
            
            return answer;
          } else {
            print('❌ No content in response');
            return 'Sorry, I encountered an error. Please try again.';
          }
        } else {
          print('❌ No candidates in response');
          return 'Sorry, I encountered an error. Please try again.';
        }
      } else {
        print('❌ Gemini API error: ${response.statusCode}');
        print('Response: ${response.body}');
        return 'Sorry, I encountered an error. Please try again.';
      }
    } catch (e) {
      print('❌ Gemini error: $e');
      return 'Sorry, I encountered an error. Please try again.';
    }
  }
}
