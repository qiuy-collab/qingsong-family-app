import { storage } from '../lib/storage';
import type { AuthProfile, LoginResponse } from '../types';
import { apiRequest } from './apiClient';

export async function demoLogin(phone: string) {
  const response = await apiRequest<LoginResponse>('/api/v1/auth/demo-login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ phone, verification_code: '123456' }),
  });
  storage.setAccessToken(response.access_token);
  storage.setProfile(response.profile);
  return response;
}

export async function fetchCurrentProfile() {
  const profile = await apiRequest<AuthProfile>('/api/v1/me');
  storage.setProfile(profile);
  return profile;
}
