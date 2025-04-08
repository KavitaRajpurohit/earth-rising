// const jwt = require("jsonwebtoken");

// const auth = (right: string) => {
// 	console.log("hello");

// 	return (req: any, res: any, next: any) => {
// 		if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
// 			jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET, function (err: any, decode: any) {
// 				if (err) req.user = undefined;
// 				// User.findOne({
// 				// 	_id: decode.id
// 				// })
// 				// 	.exec((err, user) => {
// 				// 		if (err) {
// 				// 			res.status(500)
// 				// 				.send({
// 				// 					message: err
// 				// 				});
// 				// 		} else {
// 				// 			req.user = user;
// 				// 			next();
// 				// 		}
// 				// 	})
// 			});
// 		} else {
// 			req.user = undefined;
// 			next();
// 		}
// 	}

// };
// module.exports = auth;
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import createResponse from './../utils/response';

const auth = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const secratekey: string = "1ba_pmpV(2T|$%9";
		const token: any = req.header('Authorization');
		if (!token) {
			createResponse(res, httpStatus.UNAUTHORIZED, "Please authenticate", {});
		} else {
			const decoded = jwt.verify(token, secratekey);
			req.user = decoded.sub;
			next();
		}
	} catch (err: any) {
		createResponse(res, httpStatus.UNAUTHORIZED, "Please authenticate", {});
	}
};

export default auth
