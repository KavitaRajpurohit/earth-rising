import { Strategy, ExtractJwt } from "passport-jwt";
import config from "./config";
import UserModel from "./../model/document/Usermodel";

const jwtOptions = {
	secretOrKey: config.jwt.secret,
	jwtFromRequest: ExtractJwt.fromHeader('authorization'),
};

const jwtVerify = async (payload: { sub: { user: any; }; }, done: (arg0: unknown, arg1: string | boolean) => void) => {
	// console.log(payload)
	try {
		let user: any;
		user = '';
		user = await UserModel.findById(payload.sub.user);
		if (!user) {
			return done(null, false);
		}
		done(null, user);
	} catch (error) {
		done(error, false);
	}
};

const jwtStrategy = new Strategy(jwtOptions, jwtVerify);

export default {
	jwtStrategy,
};
