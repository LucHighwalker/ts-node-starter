import User, { UserModel } from '../models/user';
import { IUser } from '../interfaces/user';

class AuthController {
  public saveUser(body: IUser) {
    return new Promise<UserModel>((resolve, reject) => {
      const user = new User(body);
      user.save((error: Error, newUser: UserModel) => {
        if (error) {
          reject(error);
        } else {
          resolve(newUser);
        }
      });
    });
  }
}

export default new AuthController();
