import * as jwt from 'jsonwebtoken';
import * as uniqid from 'uniqid';

import Mailer from '../mailer/mailer.controller';

import User, { IUserModel } from '../models/user';
import { IUser } from '../interfaces/user';
import { AuthResponse } from '../interfaces/auth';
import { resolve } from 'path';

class AuthController {
  private generateToken(user: IUserModel): AuthResponse {
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

  public async getUser(token: string): Promise<AuthResponse> {
    return new Promise<AuthResponse>((resolve, reject) => {
      const decodedToken: any = jwt.decode(token);
      const id = decodedToken._id;
      User.findById(id, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            user: {
              _id: user._id,
              email: user.email
            }
          });
        }
      });
    });
  }

  public async signup(body: IUser): Promise<AuthResponse> {
    return new Promise<AuthResponse>((resolve, reject) => {
      const { email, password, firstName, lastName } = body;
      const verified = false;
      const verifyCode = uniqid();
      const verifyExp = new Date().getDate() + 1;
      const newUser = new User({
        email,
        password,
        firstName,
        lastName,
        verified,
        verifyCode,
        verifyExp
      });
      newUser.save((err: Error, user: IUserModel) => {
        if (err) {
          reject(err);
        } else {
          const link = `http://localhost:4200/auth/verify/${
            user._id
          }/${verifyCode}`;
          // TODO: Change emails
          Mailer.sendEmail(
            'example@example.com',
            'email@luc.gg',
            'test',
            'emails/signup.hbs',
            {
              name: user.firstName,
              link
            }
          )
            .then(() => {
              const resp = this.generateToken(user);
              resolve(resp);
            })
            .catch(err => {
              reject(err);
            });
        }
      });
    });
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
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
                const resp = this.generateToken(user);
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

  public async verify(id: string, verifyCode: string): Promise<Boolean> {
    return new Promise<Boolean>((resolve, reject) => {
      User.findById(id, (err, user) => {
        if (err) {
          reject(err);
        } else {
          if (user.verifyCode === verifyCode) {
            user.verified = true;
            user.save((err, _) => {
              if (err) {
                reject(err);
              } else {
                resolve(true);
              }
            });
          } else {
            resolve(false);
          }
        }
      });
    });
  }
}

export default new AuthController();
