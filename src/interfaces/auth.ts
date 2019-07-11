export interface LoginResponse {
  token?: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface UserResponse {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
}