import User, { IUserModel } from '../models/user';
import { IUser } from '../interfaces/user';

class AuthController {
  public async signup(body: IUser) {
    return new Promise<IUserModel>((resolve, reject) => {
      const user = new User(body);
      user.save((err: Error, newUser: IUserModel) => {
        if (err) {
          reject(err);
        } else {
          resolve(newUser);
        }
      });
    });
  }

  public async login(email: string, password: string) {
    return new Promise<IUserModel>((resolve, reject) => {
      User.findOne(
        {
          email
        },
        async (err: Error, user: IUserModel) => {
          if (err) {
            reject(err);
          } else {
            try {
              const passMatch = await user.comparePassword(password);
              if (passMatch) {
                resolve(user);
              } else {
                  reject('incorrect credentials');
              }
            } catch (error) {
              reject(error);
            }
          }
        }
      );
    });
  }
}

export default new AuthController();
