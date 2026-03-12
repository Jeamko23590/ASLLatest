/// User data model for SenyaMatika app
class UserModel {
  final String uid;
  final String name;
  final String email;
  final String? school;
  final String? section;
  final DateTime createdAt;
  final DateTime? lastLogin;

  UserModel({
    required this.uid,
    required this.name,
    required this.email,
    this.school,
    this.section,
    required this.createdAt,
    this.lastLogin,
  });

  /// Convert UserModel to Map for storage
  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'name': name,
      'email': email,
      'school': school,
      'section': section,
      'createdAt': createdAt.toIso8601String(),
      'lastLogin': lastLogin?.toIso8601String(),
    };
  }

  /// Create UserModel from Map
  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      uid: map['uid'] ?? '',
      name: map['name'] ?? '',
      email: map['email'] ?? '',
      school: map['school'],
      section: map['section'],
      createdAt: DateTime.parse(map['createdAt']),
      lastLogin: map['lastLogin'] != null 
          ? DateTime.parse(map['lastLogin']) 
          : null,
    );
  }

  /// Copy with method for updating user data
  UserModel copyWith({
    String? uid,
    String? name,
    String? email,
    String? school,
    String? section,
    DateTime? createdAt,
    DateTime? lastLogin,
  }) {
    return UserModel(
      uid: uid ?? this.uid,
      name: name ?? this.name,
      email: email ?? this.email,
      school: school ?? this.school,
      section: section ?? this.section,
      createdAt: createdAt ?? this.createdAt,
      lastLogin: lastLogin ?? this.lastLogin,
    );
  }
}
