"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterResponseDto = exports.LogoutResponseDto = exports.ResetPasswordResponseDto = exports.ForgotPasswordResponseDto = exports.RefreshResponseDto = exports.LoginResponseDto = exports.AuthResponseDto = void 0;
class AuthResponseDto {
    accessToken;
    refreshToken;
    user;
    requires2FA;
    twoFactorCode;
}
exports.AuthResponseDto = AuthResponseDto;
class LoginResponseDto {
    success;
    message;
    data;
}
exports.LoginResponseDto = LoginResponseDto;
class RefreshResponseDto {
    success;
    message;
    data;
}
exports.RefreshResponseDto = RefreshResponseDto;
class ForgotPasswordResponseDto {
    success;
    message;
    data;
}
exports.ForgotPasswordResponseDto = ForgotPasswordResponseDto;
class ResetPasswordResponseDto {
    success;
    message;
}
exports.ResetPasswordResponseDto = ResetPasswordResponseDto;
class LogoutResponseDto {
    success;
    message;
}
exports.LogoutResponseDto = LogoutResponseDto;
class RegisterResponseDto {
    success;
    message;
    data;
}
exports.RegisterResponseDto = RegisterResponseDto;
//# sourceMappingURL=auth-response.dto.js.map