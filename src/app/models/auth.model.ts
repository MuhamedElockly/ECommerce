export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: number; // backend expects numeric enum (e.g., 0=admin/customer)
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  errors: any;
}

export interface LoginApiResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  errors: any;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'admin' | 'customer';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface TokenPayload {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string; // email
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string; // user id
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string; // email
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string; // role claim
  'role'?: string; // alternative role claim
  'Role'?: string; // alternative role claim
  exp: number;
  iat?: number;
  [key: string]: any; // Allow any additional claims
}


