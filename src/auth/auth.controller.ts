import * as jwt from 'jsonwebtoken';

import User, { IUserModel } from '../models/user';
import { IUser } from '../interfaces/user';

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    email: string;
  };
}

class AuthController {
  private generateResponse(user: IUserModel): AuthResponse {
    const token = jwt.sign(
      {
        _id: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '60 days'
      }
    );

    return {
      token,
      user: {
        _id: user._id,
        email: user.email
      }
    };
  }

  public async signup(body: IUser) {
    return new Promise<AuthResponse>((resolve, reject) => {
      const newUser = new User(body);
      newUser.save((err: Error, user: IUserModel) => {
        if (err) {
          reject(err);
        } else {
          const resp = this.generateResponse(user);
          resolve(resp);
        }
      });
    });
  }

  public async login(email: string, password: string) {
    return new Promise<AuthResponse>((resolve, reject) => {
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
                const resp = this.generateResponse(user);
                resolve(resp);
              } else {
                reject(new Error('Invalid credentials.'));
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
