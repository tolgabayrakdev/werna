import { apiClient } from '@/api/client';

export const userService = {
  getProfile() {
    return apiClient('/users/me');
  },

  updateProfile(data: { username?: string; email?: string }) {
    return apiClient('/users/me', {
      method: 'PATCH',
      body: data,
    });
  },
};