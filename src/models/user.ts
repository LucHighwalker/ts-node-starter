import { Document, Schema, Model, model, HookNextFunction } from "mongoose";
import { Doc } from "../interfaces/doc";
import { IUser } from "../interfaces/user";

import { genSalt, hash, compare } from "bcrypt";

export interface IUserModel extends IUser, Doc, Document {
	comparePassword(password: string): boolean;
}

export const UserSchema: Schema = new Schema({
	email: {
		type: String,
		unique: true,
		required: true,
		validate: [
			(email: string) =>
				/^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/g.test(
					email
				),
			"Invalid email."
		]
	},
	password: {
		type: String,
		min: [6, "Password too short."],
		max: [20, "Password too long."],
		required: true,
		validate: [
			function(password: string) {
				if (!this.isModified("password")) {
					return true;
				} else {
					return /([A-Z]+){1,}([a-z]+){1,}([0-9]+){1,}([?!@#$%^&*()_\-+=/\\.,<>;:'"]){1,}/g.test(
						password
					);
				}
			},
			"Password must contain an uppercase letter, lowercase letter, a number, and a symbol."
		]
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
		type: String
	},
	verifyExp: {
		type: Date
	},
	createdAt: {
		type: Date
	},
	updatedAt: {
		type: Date
	}
});

UserSchema.pre("save", function(this: IUserModel, next: HookNextFunction) {
	const now = new Date();
	this.updatedAt = now;
	if (!this.createdAt) {
		this.createdAt = now;
	}

	if (!this.isModified("password")) {
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

UserSchema.methods.comparePassword = async function(
	password: string
): Promise<boolean> {
	return await compare(password, this.password);
};

const UserModel: Model<IUserModel> = model<IUserModel>("User", UserSchema);

export default UserModel;
