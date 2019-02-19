export interface IUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  verified: boolean;
  verifyCode: string;
  verifyExp: Date;
}
