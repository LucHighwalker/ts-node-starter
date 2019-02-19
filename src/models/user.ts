import { Document, Schema, Model, model, HookNextFunction } from 'mongoose';
import { Doc } from '../interfaces/doc';
import { IUser } from '../interfaces/user';

import { genSalt, hash, compare } from 'bcrypt';

export interface IUserModel extends IUser, Doc, Document {
  comparePassword(password: string): boolean;
}

export const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    required: true
  },
  verifyCode: {
    type: String,
    required: true
  },
  verifyExp: {
    type: Date,
    required: true
  }
});

UserSchema.pre('save', function(this: IUserModel, next: HookNextFunction) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  if (!this.isModified('password')) {
    next();
  } else {
    genSalt(10, (err: Error, salt: string) => {
      if (err) {
        next();
      }
      hash(this.password, salt, (err: Error, hash: string) => {
        if (err) {
          next();
        }
        this.password = hash;
        next();
      });
    });
  }
});

UserSchema.methods.comparePassword = function(
  password: string
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    compare(password, this.password, (err: Error, isMatch: boolean) => {
      if (err) {
        reject(err);
      } else {
        resolve(isMatch);
      }
    });
  });
};

const UserModel: Model<IUserModel> = model<IUserModel>('User', UserSchema);

export default UserModel;
