/// Student progress model for tracking topic completion
class ProgressModel {
  final String userId;
  final String topicId;
  final String topicName;
  final double completionPercentage;
  final DateTime lastAccessed;
  final int timeSpentMinutes;
  final bool isCompleted;

  ProgressModel({
    required this.userId,
    required this.topicId,
    required this.topicName,
    required this.completionPercentage,
    required this.lastAccessed,
    this.timeSpentMinutes = 0,
    this.isCompleted = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'topicId': topicId,
      'topicName': topicName,
      'completionPercentage': completionPercentage,
      'lastAccessed': lastAccessed.toIso8601String(),
      'timeSpentMinutes': timeSpentMinutes,
      'isCompleted': isCompleted,
    };
  }

  factory ProgressModel.fromMap(Map<String, dynamic> map) {
    return ProgressModel(
      userId: map['userId'] ?? '',
      topicId: map['topicId'] ?? '',
      topicName: map['topicName'] ?? '',
      completionPercentage: (map['completionPercentage'] ?? 0.0).toDouble(),
      lastAccessed: DateTime.parse(map['lastAccessed']),
      timeSpentMinutes: map['timeSpentMinutes'] ?? 0,
      isCompleted: map['isCompleted'] ?? false,
    );
  }

  ProgressModel copyWith({
    String? userId,
    String? topicId,
    String? topicName,
    double? completionPercentage,
    DateTime? lastAccessed,
    int? timeSpentMinutes,
    bool? isCompleted,
  }) {
    return ProgressModel(
      userId: userId ?? this.userId,
      topicId: topicId ?? this.topicId,
      topicName: topicName ?? this.topicName,
      completionPercentage: completionPercentage ?? this.completionPercentage,
      lastAccessed: lastAccessed ?? this.lastAccessed,
      timeSpentMinutes: timeSpentMinutes ?? this.timeSpentMinutes,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }
}
