import { Request, Response, NextFunction } from 'express';
import Joi from '@hapi/joi';
import httpStatus from 'http-status';
import { pick } from 'lodash';
import AppError from './../utils/AppError';


const validate = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' } })
        .validate(object);

    if (error) {
        const errorMessage = error.details.map(details => details.message).join(', ');
        return next(new AppError(httpStatus.BAD_REQUEST, errorMessage));
    }
    Object.assign(req, value);
    return next();
};
export default validate
