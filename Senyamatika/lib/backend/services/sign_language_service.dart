import 'package:flutter/foundation.dart';

/// Service for translating text to sign language animations
class SignLanguageService {
  // Dataset mapping for ones (0-9)
  static final Map<String, String> _onesSigns = {
    '0': 'assets/DataSet/Numbers/1s/sign-0.webm',
    '1': 'assets/DataSet/Numbers/1s/sign-1.webm',
    '2': 'assets/DataSet/Numbers/1s/sign-2.webm',
    '3': 'assets/DataSet/Numbers/1s/sign-3.webm',
    '4': 'assets/DataSet/Numbers/1s/sign-4.webm',
    '5': 'assets/DataSet/Numbers/1s/sign-5.webm',
    '6': 'assets/DataSet/Numbers/1s/sign-6.webm',
    '7': 'assets/DataSet/Numbers/1s/sign-7.webm',
    '8': 'assets/DataSet/Numbers/1s/sign-8.webm',
    '9': 'assets/DataSet/Numbers/1s/sign-9.webm',
  };

  // Dataset mapping for tens (10-90)
  static final Map<String, String> _tensSigns = {
    '10': 'assets/DataSet/Numbers/10s/sign-10.webm',
    '20': 'assets/DataSet/Numbers/10s/sign-20.webm',
    '30': 'assets/DataSet/Numbers/10s/sign-30.webm',
    '40': 'assets/DataSet/Numbers/10s/sign-40.webm',
    '50': 'assets/DataSet/Numbers/10s/sign-50.webm',
    '60': 'assets/DataSet/Numbers/10s/sign-60.webm',
    '70': 'assets/DataSet/Numbers/10s/sign-70.webm',
    '80': 'assets/DataSet/Numbers/10s/sign-80.webm',
    '90': 'assets/DataSet/Numbers/10s/sign-90.webm',
  };

  // Dataset mapping for hundreds (100-900)
  static final Map<String, String> _hundredsSigns = {
    '100': 'assets/DataSet/Numbers/100s/sign-100.webm',
    '200': 'assets/DataSet/Numbers/100s/sign-200.webm',
    '300': 'assets/DataSet/Numbers/100s/sign-300.webm',
    '400': 'assets/DataSet/Numbers/100s/sign-400.webm',
    '500': 'assets/DataSet/Numbers/100s/sign-500.webm',
    '600': 'assets/DataSet/Numbers/100s/sign-600.webm',
    '700': 'assets/DataSet/Numbers/100s/sign-700.webm',
    '800': 'assets/DataSet/Numbers/100s/sign-800.webm',
    '900': 'assets/DataSet/Numbers/100s/sign-900.webm',
  };

  // Dataset mapping for thousands (1000-9000)
  static final Map<String, String> _thousandsSigns = {
    '1000': 'assets/DataSet/Numbers/1000s/sign-1000.webm',
    '2000': 'assets/DataSet/Numbers/1000s/sign-2000.webm',
    '3000': 'assets/DataSet/Numbers/1000s/sign-3000.webm',
    '4000': 'assets/DataSet/Numbers/1000s/sign-4000.webm',
    '5000': 'assets/DataSet/Numbers/1000s/sign-5000.webm',
    '6000': 'assets/DataSet/Numbers/1000s/sign-6000.webm',
    '7000': 'assets/DataSet/Numbers/1000s/sign-7000.webm',
    '8000': 'assets/DataSet/Numbers/1000s/sign-8000.webm',
    '9000': 'assets/DataSet/Numbers/1000s/sign-9000.webm',
  };

  // Dataset mapping for operators
  static final Map<String, String> _operatorSigns = {
    '+': 'assets/DataSet/Operators/sign-plus.webm',
    '-': 'assets/DataSet/Operators/sign-minus.webm',
    '*': 'assets/DataSet/Operators/sign-multiply.webm',
    'x': 'assets/DataSet/Operators/sign-multiply.webm', // Alternative multiply symbol
    '×': 'assets/DataSet/Operators/sign-multiply.webm', // Alternative multiply symbol
    '/': 'assets/DataSet/Operators/sign-divide.webm',
    '÷': 'assets/DataSet/Operators/sign-divide.webm', // Alternative divide symbol
    '=': 'assets/DataSet/Operators/sign-equals.webm',
    '<': 'assets/DataSet/Operators/sign-less.than.webm',
    '>': 'assets/DataSet/Operators/sign-more.than.webm',
    '.': 'assets/DataSet/Operators/sign-dot.webm',
    '%': 'assets/DataSet/Operators/sign-percent.webm',
  };

  // Dataset mapping for words (to be added later)
  static final Map<String, String> _wordSigns = {
    // Numbers as words
    'zero': 'assets/DataSet/Numbers/1s/sign-0.webm',
    'one': 'assets/DataSet/Numbers/1s/sign-1.webm',
    'two': 'assets/DataSet/Numbers/1s/sign-2.webm',
    'three': 'assets/DataSet/Numbers/1s/sign-3.webm',
    'four': 'assets/DataSet/Numbers/1s/sign-4.webm',
    'five': 'assets/DataSet/Numbers/1s/sign-5.webm',
    'six': 'assets/DataSet/Numbers/1s/sign-6.webm',
    'seven': 'assets/DataSet/Numbers/1s/sign-7.webm',
    'eight': 'assets/DataSet/Numbers/1s/sign-8.webm',
    'nine': 'assets/DataSet/Numbers/1s/sign-9.webm',
    // Operators as words
    'plus': 'assets/DataSet/Operators/sign-plus.webm',
    'add': 'assets/DataSet/Operators/sign-plus.webm',
    'minus': 'assets/DataSet/Operators/sign-minus.webm',
    'subtract': 'assets/DataSet/Operators/sign-minus.webm',
    'times': 'assets/DataSet/Operators/sign-multiply.webm',
    'multiply': 'assets/DataSet/Operators/sign-multiply.webm',
    'divide': 'assets/DataSet/Operators/sign-divide.webm',
    'equals': 'assets/DataSet/Operators/sign-equals.webm',
    'equal': 'assets/DataSet/Operators/sign-equals.webm',
    'less than': 'assets/DataSet/Operators/sign-less.than.webm',
    'greater than': 'assets/DataSet/Operators/sign-more.than.webm',
    'more than': 'assets/DataSet/Operators/sign-more.than.webm',
    'dot': 'assets/DataSet/Operators/sign-dot.webm',
    'point': 'assets/DataSet/Operators/sign-dot.webm',
    'percent': 'assets/DataSet/Operators/sign-percent.webm',
    // Math terms from Dictionary folder
    'algebra': 'assets/DataSet/Dictionary/sign-algebra.webm',
    'convert': 'assets/DataSet/Dictionary/sign-convert.webm',
    'decimal number': 'assets/DataSet/Dictionary/sign-decimal-number.webm',
    'decimal': 'assets/DataSet/Dictionary/sign-decimal-number.webm',
    'decrease': 'assets/DataSet/Dictionary/sign-decrease.webm',
    'denominator': 'assets/DataSet/Dictionary/sign-denominator.webm',
    'equation': 'assets/DataSet/Dictionary/sign-equation.webm',
    'fraction': 'assets/DataSet/Dictionary/sign-fraction.webm',
    'fundamental operation': 'assets/DataSet/Dictionary/sign-fundamental-operation.webm',
    'fundamental': 'assets/DataSet/Dictionary/sign-fundamental-operation.webm',
    'operation': 'assets/DataSet/Dictionary/sign-fundamental-operation.webm',
    'greatest': 'assets/DataSet/Dictionary/sign-greatest.webm',
    'increase': 'assets/DataSet/Dictionary/sign-increase.webm',
    'least': 'assets/DataSet/Dictionary/sign-least.webm',
    'math': 'assets/DataSet/Dictionary/sign-math.webm',
    'mathematics': 'assets/DataSet/Dictionary/sign-math.webm',
    'number value': 'assets/DataSet/Dictionary/sign-number-value.webm',
    'value': 'assets/DataSet/Dictionary/sign-number-value.webm',
    'number': 'assets/DataSet/Dictionary/sign-number.webm',
    'numerator': 'assets/DataSet/Dictionary/sign-numerator.webm',
  };
  
  /// Get all available signs as a dictionary (for dictionary page)
  static Map<String, String> getAllSigns() {
    final Map<String, String> allSigns = {};
    
    // Add all number signs with labels
    _onesSigns.forEach((key, value) => allSigns['Number $key'] = value);
    _tensSigns.forEach((key, value) => allSigns['Number $key'] = value);
    _hundredsSigns.forEach((key, value) => allSigns['Number $key'] = value);
    _thousandsSigns.forEach((key, value) => allSigns['Number $key'] = value);
    
    // Add operator signs with labels
    allSigns['Plus (+)'] = _operatorSigns['+']!;
    allSigns['Minus (-)'] = _operatorSigns['-']!;
    allSigns['Multiply (×)'] = _operatorSigns['*']!;
    allSigns['Divide (÷)'] = _operatorSigns['/']!;
    allSigns['Equals (=)'] = _operatorSigns['=']!;
    allSigns['Less Than (<)'] = _operatorSigns['<']!;
    allSigns['Greater Than (>)'] = _operatorSigns['>']!;
    allSigns['Decimal Point (.)'] = _operatorSigns['.']!;
    allSigns['Percent (%)'] = _operatorSigns['%']!;
    
    return allSigns;
  }
  
  /// Get signs by category
  static Map<String, String> getSignsByCategory(String category) {
    switch (category.toLowerCase()) {
      case 'numbers':
      case 'ones':
        return Map.from(_onesSigns);
      case 'tens':
        return Map.from(_tensSigns);
      case 'hundreds':
        return Map.from(_hundredsSigns);
      case 'thousands':
        return Map.from(_thousandsSigns);
      case 'operators':
        return Map.from(_operatorSigns);
      default:
        return {};
    }
  }

  /// Translate text to a sequence of sign language videos
  /// Returns a list of video paths to play in order
  static List<String> translateToSignSequence(String text) {
    final normalizedText = text.trim().toLowerCase();
    final List<String> signSequence = [];
    
    debugPrint('🔤 Translating: "$normalizedText"');
    
    // Replace word forms with symbols before processing
    String processedText = _replaceWordForms(normalizedText);
    debugPrint('🔄 After word replacement: "$processedText"');
    
    // Check if it's a complete word/phrase first
    if (_wordSigns.containsKey(processedText)) {
      signSequence.add(_wordSigns[processedText]!);
      debugPrint('✅ Found word sign: ${_wordSigns[processedText]}');
      return signSequence;
    }
    
    // Process character by character or as numbers
    int i = 0;
    while (i < processedText.length) {
      final char = processedText[i];
      
      // Check if it's a digit - try to parse as a multi-digit number
      if (_isDigit(char)) {
        // Check if there are spaces between digits (e.g., "3 0 0")
        bool hasSpaces = false;
        if (i + 1 < processedText.length && processedText[i + 1] == ' ') {
          // Look ahead to see if next non-space is also a digit
          int nextPos = i + 2;
          while (nextPos < processedText.length && processedText[nextPos] == ' ') {
            nextPos++;
          }
          if (nextPos < processedText.length && _isDigit(processedText[nextPos])) {
            hasSpaces = true;
          }
        }
        
        if (hasSpaces) {
          // Process as individual digits
          signSequence.add(_onesSigns[char]!);
          debugPrint('✅ Added ones sign: $char → ${_onesSigns[char]}');
          i++;
        } else {
          // Try to parse as a multi-digit number
          String numberStr = '';
          int startPos = i;
          while (i < processedText.length && _isDigit(processedText[i])) {
            numberStr += processedText[i];
            i++;
          }
          
          // Parse the number and break it down
          int number = int.parse(numberStr);
          List<String> numberSigns = _parseNumber(number);
          signSequence.addAll(numberSigns);
          debugPrint('✅ Parsed number $number into ${numberSigns.length} signs');
          continue; // Skip the i++ at the end since we already moved i
        }
      }
      // Check if it's an operator
      else if (_operatorSigns.containsKey(char)) {
        signSequence.add(_operatorSigns[char]!);
        debugPrint('✅ Added operator sign: $char → ${_operatorSigns[char]}');
        i++;
      }
      // Skip spaces
      else if (char == ' ') {
        debugPrint('⏭️ Skipping space');
        i++;
      }
      else {
        debugPrint('⚠️ No sign found for character: "$char"');
        i++;
      }
    }
    
    if (signSequence.isEmpty) {
      debugPrint('❌ No signs found for: "$normalizedText"');
    } else {
      debugPrint('✅ Total signs in sequence: ${signSequence.length}');
    }
    
    return signSequence;
  }

  /// Check if a character is a digit
  static bool _isDigit(String char) {
    return char.codeUnitAt(0) >= 48 && char.codeUnitAt(0) <= 57; // '0' to '9'
  }

  /// Parse a number and break it down into thousands, hundreds, tens, and ones
  /// Example: 3456 = 3000 + 400 + 50 + 6
  static List<String> _parseNumber(int number) {
    List<String> signs = [];
    
    if (number == 0) {
      signs.add(_onesSigns['0']!);
      return signs;
    }
    
    // Extract thousands (1000, 2000, etc.)
    int thousands = (number ~/ 1000) * 1000;
    if (thousands > 0 && _thousandsSigns.containsKey(thousands.toString())) {
      signs.add(_thousandsSigns[thousands.toString()]!);
      debugPrint('  → Added thousands: $thousands');
    }
    
    // Extract hundreds (300, 400, etc.)
    int remainder = number % 1000;
    int hundreds = (remainder ~/ 100) * 100;
    if (hundreds > 0 && _hundredsSigns.containsKey(hundreds.toString())) {
      signs.add(_hundredsSigns[hundreds.toString()]!);
      debugPrint('  → Added hundreds: $hundreds');
    }
    
    // Extract tens (20, 30, etc.)
    remainder = remainder % 100;
    int tens = (remainder ~/ 10) * 10;
    if (tens > 0 && _tensSigns.containsKey(tens.toString())) {
      signs.add(_tensSigns[tens.toString()]!);
      debugPrint('  → Added tens: $tens');
    }
    
    // Extract ones (1, 2, 3, etc.)
    int ones = remainder % 10;
    if (ones > 0 && _onesSigns.containsKey(ones.toString())) {
      signs.add(_onesSigns[ones.toString()]!);
      debugPrint('  → Added ones: $ones');
    }
    
    return signs;
  }

  /// Replace word forms with their symbol equivalents
  static String _replaceWordForms(String text) {
    // Word to symbol mappings
    final Map<String, String> wordReplacements = {
      // Numbers
      'zero': '0',
      'one': '1',
      'two': '2',
      'three': '3',
      'four': '4',
      'five': '5',
      'six': '6',
      'seven': '7',
      'eight': '8',
      'nine': '9',
      // Thousands
      'one thousand': '1000',
      'two thousand': '2000',
      'three thousand': '3000',
      'four thousand': '4000',
      'five thousand': '5000',
      'six thousand': '6000',
      'seven thousand': '7000',
      'eight thousand': '8000',
      'nine thousand': '9000',
      // Hundreds
      'one hundred': '100',
      'two hundred': '200',
      'three hundred': '300',
      'four hundred': '400',
      'five hundred': '500',
      'six hundred': '600',
      'seven hundred': '700',
      'eight hundred': '800',
      'nine hundred': '900',
      // Tens
      'ten': '10',
      'twenty': '20',
      'thirty': '30',
      'forty': '40',
      'fifty': '50',
      'sixty': '60',
      'seventy': '70',
      'eighty': '80',
      'ninety': '90',
      // Operators
      'plus': '+',
      'add': '+',
      'minus': '-',
      'subtract': '-',
      'times': '*',
      'multiply': '*',
      'multiplied': '*',
      'divide': '/',
      'divided': '/',
      'equals': '=',
      'equal': '=',
      'less than': '<',
      'lessthan': '<',
      'greater than': '>',
      'greaterthan': '>',
      'more than': '>',
      'morethan': '>',
      'point': '.',
      'dot': '.',
      'period': '.',
      'decimal': '.',
      'percent': '%',
      'percentage': '%',
    };
    
    String result = text;
    
    // Replace each word form with its symbol (process longer phrases first)
    var sortedEntries = wordReplacements.entries.toList()
      ..sort((a, b) => b.key.length.compareTo(a.key.length));
    
    for (var entry in sortedEntries) {
      // Use word boundaries to avoid partial matches
      result = result.replaceAll(RegExp('\\b${entry.key}\\b'), entry.value);
    }
    
    return result;
  }

  /// Add operator signs to the dataset
  static void addOperatorSigns(Map<String, String> operators) {
    _operatorSigns.addAll(operators);
    debugPrint('✅ Added ${operators.length} operator signs');
  }

  /// Add word signs to the dataset
  static void addWordSigns(Map<String, String> words) {
    _wordSigns.addAll(words);
    debugPrint('✅ Added ${words.length} word signs');
  }

  /// Get total dataset size
  static int getDatasetSize() {
    return _onesSigns.length + _tensSigns.length + _hundredsSigns.length + _thousandsSigns.length + _operatorSigns.length + _wordSigns.length;
  }

  /// Check if text can be fully translated
  static bool canTranslate(String text) {
    final sequence = translateToSignSequence(text);
    return sequence.isNotEmpty;
  }
}
