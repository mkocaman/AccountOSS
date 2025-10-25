import client from '../utils/client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
    fullName: string;
    expiresAt: string;
  };
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await client.post('/auth/login', data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await client.post('/auth/logout');
  localStorage.clear();
};
