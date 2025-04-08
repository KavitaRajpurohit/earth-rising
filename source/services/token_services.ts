import moment from "moment";
import jwt from "jsonwebtoken";
import constant from "./../config/constant"
import config from './../config/config'
import Tokens from './../model/document/Tokenmdel';
import TOKEN_TYPE from '../config/constant';
import AppError from '../utils/AppError';
import httpStatus from 'http-status';
const generateToken = (user: any, role: any, expires: { unix: () => any; }, secret = config.jwt.secret) => {
    const payload = {
        sub: { user, role },
        iat: moment().unix(),
        exp: expires.unix()
    };
    return jwt.sign(payload, secret);
};
const saveToken = async (token: any, userId: any, expires: moment.Moment, type: any, blacklisted = false) => {
    const tokenDoc = await Tokens.create({
        token,
        user: userId,
        expiresAt: expires.toDate(),
        type,
        blacklisted,
    });
    return tokenDoc;
};
const generateAuthTokens = async (userId: any, role: any) => {
    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = generateToken(userId, role, accessTokenExpires);
    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
    const refreshToken = generateToken(userId, role, refreshTokenExpires);
    await saveToken(refreshToken, userId, refreshTokenExpires, constant.TOKEN_TYPE.REFRESH_TOKEN);

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    };
};

const generateResetPasswordToken = async (data: any) => {
    const expires = moment().add(
        config.jwt.resetPasswordExpirationMinutes,
        "minutes"
    )
    console.log(expires);
    const resetPasswordToken = generateToken(
        { _id: data._id }, data.sUserRole,
        expires
    );
    await saveToken(resetPasswordToken, data._id, expires, constant.TOKEN_TYPE.RESET_PASSWORD);


    return resetPasswordToken;
};
const generateVerifyPasswordToken = async (data: any) => {
    const expires = moment().add(
        config.jwt.resetPasswordExpirationMinutes,
        "minutes"
    )
    console.log(expires);
    const resetPasswordToken = generateToken(
        { _id: data._id }, data.sUserRole,
        expires
    );
    await saveToken(resetPasswordToken, data._id, expires, constant.TOKEN_TYPE.VERIFICATION_TOKEN);


    return resetPasswordToken;
};

const verifyToken = async (token: any, type: any) => {
    const payload: any = jwt.verify(token, config.jwt.secret);
    console.log(payload, 'payload----');

    const tokenDoc: any = await Tokens.findOne({ token, type, user: payload.sub.user._id });
    console.log(tokenDoc, 'tokenDoc!!!!!!!!!');
    
    if (!tokenDoc) {
        throw new AppError(httpStatus.NOT_FOUND, 'The link has expired!');
    }
    return payload;
};
const refreshVerifyToken = async (token: any, type: any) => {
    const payload: any = jwt.verify(token, config.jwt.secret);
    console.log(payload);

    const tokenDoc: any = await Tokens.findOne({ token, type, user: payload.sub.user });
    if (!tokenDoc) {
        throw new AppError(httpStatus.NOT_FOUND, 'The link has expired!');
    }
    return payload;
};
export default {
    generateAuthTokens,
    generateResetPasswordToken,
    verifyToken,
    generateVerifyPasswordToken,
    refreshVerifyToken
}