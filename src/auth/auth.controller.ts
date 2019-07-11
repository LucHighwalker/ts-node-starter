import * as jwt from "jsonwebtoken";
import * as uniqid from "uniqid";

import Mailer from "../mailer/mailer.controller";

import User, { IUserModel } from "../models/user";
import { IUser } from "../interfaces/user";
import { LoginResponse, UserResponse } from "../interfaces/auth";

class AuthController {
	private generateToken(user: IUserModel): LoginResponse {
		const token = jwt.sign(
			{
				_id: user._id
			},
			process.env.JWT_SECRET,
			{
				expiresIn: "60 days"
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

	public async getUser(token: string): Promise<UserResponse> {
		const decodedToken: any = jwt.decode(token);
		if (decodedToken !== null) {
			const id = decodedToken._id;
			const user = await User.findById(id);
			return {
				_id: user._id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName
			};
		}
	}

	public async login(email: string, password: string): Promise<LoginResponse> {
		const user = await User.findOne({ email });
		const passMatch = await user.comparePassword(password);
		if (passMatch) {
			return this.generateToken(user);
		} else {
			throw new Error("Invalid credentials.");
		}
	}

	public async signup(body: IUser): Promise<LoginResponse> {
		const { email, password, firstName, lastName } = body;
		const verifyExp = new Date();
		verifyExp.setDate(verifyExp.getDate() + 1);

		const user = new User({
			email,
			password,
			firstName,
			lastName,
			verified: false,
			verifyCode: uniqid(),
			verifyExp
		});

		await user.save();
		const link = `${process.env.HOST_URL}/auth/verify/${user._id}/${
			user.verifyCode
		}`;

		Mailer.sendEmail(
			"no-reply@zover.com",
			user.email,
			"Welcome",
			"emails/signup.hbs",
			{
				name: user.firstName,
				link
			}
		);

		return this.generateToken(user);
	}

	public async resendVerification(token: string): Promise<void> {
		const decodedToken: any = jwt.decode(token);
		const id = decodedToken._id;
		const today = new Date();
		const user = await User.findById(id);

		user.verifyExp.setDate(today.getDate() + 1);
		user.verifyCode = uniqid();
		await user.save();

		const link = `${process.env.HOST_URL}/auth/verify/${user._id}/${
			user.verifyCode
		}`;

		await Mailer.sendEmail(
			"no-reply@tsnode.com",
			user.email,
			"Verify Email",
			"emails/signup.hbs",
			{
				name: user.firstName,
				link
			}
		);
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
						resolve("Verification link expired.");
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
							resolve("Invalid verification link.");
						}
					}
				}
			});
		});
	}

	public authenticate = (req: any, _: any, next: Function) => {
		const token = req.get("token") ? req.get("token") : null;
		if (token === null) {
			req.user = null;
		} else {
			const decodedToken: any = jwt.decode(token, { complete: true }) || {
				payload: null
			};
			req.user = decodedToken.payload;
		}

		next();
	};
}

export default new AuthController();
