/// Quiz attempt model for tracking quiz results
class QuizAttemptModel {
  final String userId;
  final String quizId;
  final String topicId;
  final int score;
  final int totalQuestions;
  final DateTime timestamp;
  final int timeSpentSeconds;

  QuizAttemptModel({
    required this.userId,
    required this.quizId,
    required this.topicId,
    required this.score,
    required this.totalQuestions,
    required this.timestamp,
    this.timeSpentSeconds = 0,
  });

  double get percentage => (score / totalQuestions) * 100;

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'quizId': quizId,
      'topicId': topicId,
      'score': score,
      'totalQuestions': totalQuestions,
      'timestamp': timestamp.toIso8601String(),
      'timeSpentSeconds': timeSpentSeconds,
      'percentage': percentage,
    };
  }

  factory QuizAttemptModel.fromMap(Map<String, dynamic> map) {
    return QuizAttemptModel(
      userId: map['userId'] ?? '',
      quizId: map['quizId'] ?? '',
      topicId: map['topicId'] ?? '',
      score: map['score'] ?? 0,
      totalQuestions: map['totalQuestions'] ?? 0,
      timestamp: DateTime.parse(map['timestamp']),
      timeSpentSeconds: map['timeSpentSeconds'] ?? 0,
    );
  }
}
