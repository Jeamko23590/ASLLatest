/// Standard API response wrapper
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final String? error;

  ApiResponse({
    required this.success,
    this.data,
    this.message,
    this.error,
  });

  factory ApiResponse.success({T? data, String? message}) {
    return ApiResponse(
      success: true,
      data: data,
      message: message,
    );
  }

  factory ApiResponse.failure({required String error}) {
    return ApiResponse(
      success: false,
      error: error,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'data': data,
      'message': message,
      'error': error,
    };
  }
}

/// API error codes
class ApiErrorCodes {
  static const String authFailed = 'AUTH_FAILED';
  static const String userNotFound = 'USER_NOT_FOUND';
  static const String invalidCredentials = 'INVALID_CREDENTIALS';
  static const String emailAlreadyExists = 'EMAIL_ALREADY_EXISTS';
  static const String weakPassword = 'WEAK_PASSWORD';
  static const String networkError = 'NETWORK_ERROR';
  static const String serverError = 'SERVER_ERROR';
  static const String unknownError = 'UNKNOWN_ERROR';
}
