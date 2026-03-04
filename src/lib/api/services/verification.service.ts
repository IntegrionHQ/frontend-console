import { api } from '../client';
import type { ApiResponse } from '../types';

export const verificationService = {
  sendOtp: async (email: string): Promise<ApiResponse<object>> => {
    return api.post<object>('/auth/send-otp', { email });
  },

  verifyOtp: async (email: string, code: string): Promise<ApiResponse<object>> => {
    return api.post<object>('/auth/verify-otp', { email, code });
  },

  verifyEmail: async (email: string): Promise<ApiResponse<object>> => {
    return api.post<object>('/auth/verify-email', { email });
  },

  resetPassword: async (email: string, password: string): Promise<ApiResponse<object>> => {
    return api.post<object>('/auth/reset-password', { email, password });
  },
};
