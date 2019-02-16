import { Document, Schema, Model, model, HookNextFunction } from 'mongoose';
import { Doc } from '../interfaces/doc';
import { IUser } from '../interfaces/user';

import { genSalt, hash, compare } from 'bcrypt';

export interface UserModel extends IUser, Doc, Document {
  comparePassword(): boolean;
}

export const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true
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
  }
});

UserSchema.pre('save', function(this: UserModel, next: HookNextFunction) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  if (!this.isModified('password')) {
    next();
  } else {
    genSalt(10, (error: Error, salt: string) => {
      if (error) {
        next();
      }
      hash(this.password, salt, (error: Error, hash: string) => {
        if (error) {
          next();
        }
        this.password = hash;
        next();
      });
    });
  }
});

UserSchema.methods.comparePassword = function(password: string): boolean {
  let match = false;
  compare(password, this.password, (error, isMatch) => {
    if (error) {
      match = false;
    } else {
      match = isMatch;
    }
  });
  return match;
};

const UserModel: Model<UserModel> = model<UserModel>('User', UserSchema);

export default UserModel;
