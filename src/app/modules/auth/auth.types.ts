export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthPayload {
  id: number;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}
