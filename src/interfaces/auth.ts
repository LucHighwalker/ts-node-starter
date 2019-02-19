export interface AuthResponse {
  token?: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}