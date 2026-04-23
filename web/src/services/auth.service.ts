import { apiClient } from '@/api/client';

export const authService = {
  register(data: { email: string; username: string; password: string }) {
    return apiClient('/auth/register', {
      method: 'POST',
      body: data,
    });
  },

  verify(data: { userId: string; code: string }) {
    return apiClient('/auth/verify', {
      method: 'POST',
      body: data,
    });
  },

  resendVerification(userId: string) {
    return apiClient('/auth/resend-verification', {
      method: 'POST',
      body: { userId },
    });
  },

  resendVerificationByEmail(email: string) {
    return apiClient('/auth/resend-verification', {
      method: 'POST',
      body: { email },
    });
  },

  login(data: { email: string; password: string }) {
    return apiClient('/auth/login', {
      method: 'POST',
      body: data,
    });
  },

  refreshToken() {
    return apiClient('/auth/refresh', {
      method: 'POST',
    });
  },

  logout() {
    return apiClient('/auth/logout', {
      method: 'POST',
    });
  },
};