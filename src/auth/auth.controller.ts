import * as jwt from 'jsonwebtoken';
import * as uniqid from 'uniqid';

import Mailer from '../mailer/mailer.controller';

import User, { IUserModel } from '../models/user';
import { IUser } from '../interfaces/user';
import { AuthResponse } from '../interfaces/auth';

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
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };
  }

  public async getUser(token: string): Promise<AuthResponse> {
    return new Promise<AuthResponse>((resolve, reject) => {
      const decodedToken: any = jwt.decode(token);
      if (decodedToken !== null) {
        const id = decodedToken._id;
        User.findById(id, (err, user) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
              }
            });
          }
        });
      } else {
        reject(new Error('Invalid token.'));
      }
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

  public async signup(body: IUser): Promise<AuthResponse> {
    return new Promise<AuthResponse>((resolve, reject) => {
      const { email, password, firstName, lastName } = body;
      const verifyExp = new Date();
      verifyExp.setDate(verifyExp.getDate() + 1);

      const newUser = new User({
        email,
        password,
        firstName,
        lastName,
        verified: false,
        verifyCode: uniqid(),
        verifyExp
      });

      newUser.save((err: Error, user: IUserModel) => {
        if (err) {
          reject(err);
        } else {
          const link = `${process.env.HOST_URL}/auth/verify/${user._id}/${
            user.verifyCode
          }`;
          // TODO: Change emails
          Mailer.sendEmail(
            'no-reply@tsnode.com',
            user.email,
            'Welcome',
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

  public async resendVerification(token: string): Promise<Boolean> {
    return new Promise<Boolean>((resolve, reject) => {
      const decodedToken: any = jwt.decode(token);
      const id = decodedToken._id;
      User.findById(id, (err, user) => {
        if (err) {
          reject(err);
        } else {
          const today = new Date();
          user.verifyExp.setDate(today.getDate() + 1);
          user.verifyCode = uniqid();
          user.save((err, _) => {
            if (err) {
              reject(err);
            } else {
              const link = `${process.env.HOST_URL}/auth/verify/${user._id}/${
                user.verifyCode
              }`;
              // TODO: Change emails
              Mailer.sendEmail(
                'no-reply@tsnode.com',
                user.email,
                'Verify Email',
                'emails/signup.hbs',
                {
                  name: user.firstName,
                  link
                }
              )
                .then(() => {
                  resolve(true);
                })
                .catch(err => {
                  reject(err);
                });
            }
          });
        }
      });
    });
  }

  public async verify(
    id: string,
    verifyCode: string
  ): Promise<Boolean | String> {
    return new Promise<Boolean | String>((resolve, reject) => {
      User.findById(id, (err, user) => {
        if (err) {
          reject(err);
        } else {
          const today = new Date();
          if (user.verifyExp < today) {
            resolve('Verification link expired.');
          } else {
            if (user.verifyCode === verifyCode) {
              user.verified = true;
              user.verifyCode = undefined;
              user.verifyExp = undefined;
              user.save((err, _) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(true);
                }
              });
            } else {
              resolve('Invalid verification link.');
            }
          }
        }
      });
    });
  }
}

export default new AuthController();
