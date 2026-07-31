/** Barrel do domínio de autenticação (`@domain/auth`). */

export {
  AUTH_ERROR_MESSAGE,
  AuthError,
  toAuthErrorCode,
  type AuthErrorCode,
  type AuthProvider,
  type AuthSession,
  type AuthUser,
  type OtpChallenge,
  type OtpChannel,
} from './authTypes';
export {
  GATE_ROUTE,
  resolveGateRoute,
  resolveGateStep,
  type GateFlags,
  type GateRoute,
  type GateStep,
} from './authGate';
export {
  OTP_LENGTH,
  formatOtpCode,
  formatOtpDestination,
  isChallengeExpired,
  isOtpCodeComplete,
  isOtpDestinationComplete,
  maskOtpDestination,
  otpChannelOf,
} from './otp';
export { authService } from './authService';
export { MOCK_OTP_CODE } from './authApi';
