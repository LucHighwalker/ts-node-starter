import { Document, Schema, Model, model, HookNextFunction } from "mongoose";
import { Doc } from "../interfaces/doc";
import { IUser } from "../interfaces/user";

export interface IUserModel extends IUser, Doc, Document {
  fullName(): string;
}

export const UserSchema: Schema = new Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String
});

UserSchema.pre("save", function(this: IUserModel, next: HookNextFunction) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }
  next();
});

UserSchema.methods.fullName = function(): string {
  return this.firstName.trim() + " " + this.lastName.trim();
};

export const User: Model<IUserModel> = model<IUserModel>("User", UserSchema);
