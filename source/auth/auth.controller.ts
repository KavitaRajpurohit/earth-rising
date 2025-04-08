import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import authService from './auth.services'
import createResponse from './../utils/response'
import Messages from './../utils/messages'
import bcrypt from 'bcryptjs';
import authServices from './auth.services';
import emailService from './../services/email_services';
import tokenService from './../services/token_services';
import AppError from '../utils/AppError';
import { update } from 'lodash';


const login = async (req: Request, res: Response, next: NextFunction) => {

    try {
        let { sEmail, sPassword } = req.body;

        const user: any = await authService.adminlogin(sEmail, sPassword);
        console.log("USER", user)
        const tokens = await tokenService.generateAuthTokens(user._id, user.sUserRole);
        const response = { user: user.transform(), tokens };
        createResponse(res, httpStatus.OK, Messages.LOGIN, response);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }

};

const userSignup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { sEmail, sPassword } = req.body;
        const user: any = await authServices.signupUser(sEmail, sPassword);
        const tokens = await tokenService.generateAuthTokens(user._id, user.sUserRole);
        const verifytokens = await tokenService.generateVerifyPasswordToken(user);
        await emailService.sendVerifyUserEmail(sEmail, user, verifytokens)
        const response = { user: user, tokens };
        createResponse(res, httpStatus.OK, Messages.VERIFY_SUCCESS, response);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const userLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { sEmail, sPassword } = req.body;
        const user: any = await authServices.userLogin(sEmail, sPassword);
        if (user.isVerify === false) {
            createResponse(res, httpStatus.OK, Messages.VERIFY_NOT_ACCOUNT, { user: user });
        } else {
            const tokens = await tokenService.generateAuthTokens(user._id, user.sUserRole);
            const response = { user: user, tokens };
            createResponse(res, httpStatus.OK, Messages.LOGIN, response);
        }
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const forgotpassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { sEmail, sUserRole } = req.body;
        const user: any = await authService.checkEmail(sEmail, sUserRole);
        const tokens = await tokenService.generateResetPasswordToken(user);
        await emailService.sendForgotPasswordEmail(sEmail, user, tokens)
        createResponse(res, httpStatus.OK, Messages.FORGOT_PASSWORD.replace('$', user.sEmail), {});
    } catch (error: any) {
        console.log(error);
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { sPassword } = req.body;
        let { token } = req.params;
        sPassword = await bcrypt.hash(sPassword, 8);
        let userData = await authService.resetPassword(token, sPassword);
        createResponse(res, httpStatus.OK, Messages.RESET_PASSWORD, userData);
    } catch (error: any) {
        if (error.message === "jwt expired") {
            error.message = "Your reset password link expired."
        }
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const checkLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { token } = req.params;
        let userData = await authService.checkLinkToken(token);
        createResponse(res, httpStatus.OK, Messages.VERIFY_ACCOUNT, userData);
    } catch (error: any) {
        if (error.message === "jwt expired") {
            error.message = "Your reset password link expired."
        }
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};
const checkResetLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { token } = req.params;
        let userData = await authService.checkResetLinkToken(token);
        createResponse(res, httpStatus.OK, Messages.VERIFY_ACCOUNT, userData);
    } catch (error: any) {
        if (error.message === "jwt expired") {
            error.message = "Your reset password link expired."
        }
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const sendVerifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { sEmail, sUserRole } = req.body;
        // const user = await authServices.signupUser(sEmail, sPassword);
        const user: any = await authService.checkVerifyEmail(sEmail, sUserRole);
        const tokens = await tokenService.generateVerifyPasswordToken(user);
        // const tokens = await tokenService.generateAuthTokens(user._id, user.sUserRole);
        await emailService.sendVerifyUserEmail(sEmail, user, tokens)
        createResponse(res, httpStatus.OK, Messages.VERIFY_SUCCESS, user);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const onBoarding = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: any = await authService.onboardingData(
            req.params.id,
            req.body
        );
        createResponse(res, httpStatus.OK, Messages.UPDATE, user);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: any = await authService.updateProfile(req.query.id, req.body)
        createResponse(res, httpStatus.OK, Messages.UPDATE_PROFILE, user);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const createTribe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tribe: any = await authService.createTribe(req.body);
        createResponse(res, httpStatus.OK, `Tribe "${tribe.sTitle}" has been created successfully.`, tribe);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const getTribe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tribe: any = await authService.getTribe(req.params.id);
        if (tribe.sStatus !== 'Delete') {
            createResponse(res, httpStatus.OK, Messages.GET_TRIBE, tribe);
        } else {
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.TRIBE_NOT_FOUND);
        }
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const getallTribes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tribe: any = await authService.getallTribes(req.query.id, req.query.search);
        createResponse(res, httpStatus.OK, Messages.GET_ALL_TRIBE, tribe);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};


const getallPartners = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const partner: any = await authService.getallPartners(req.query);
        createResponse(res, httpStatus.OK, Messages.GET_ALL_PARTNER, partner);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const deleteTribe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tribe: any = await authService.updateTribe(req.params.id, { sStatus: 'Delete' });
        createResponse(res, httpStatus.OK, `Tribe "${tribe.sTitle}" has been successfully deleted.`, tribe);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};
const updateTribe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tribe: any = await authService.updateTribe(req.params.id, req.body);
        createResponse(res, httpStatus.OK, `Tribe "${tribe.sTitle}" details have been successfully updated.`, tribe);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const getallProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product: any = await authService.getallProduct(req.query);
        createResponse(res, httpStatus.OK, Messages.GET_ALL_PRODUCT, product);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const followRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const follow: any = await authService.followRequest(req.body);
        createResponse(res, httpStatus.OK, Messages.FOLLOW_TRIBE, follow);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const updateRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const follow: any = await authService.updateRequest(req.body, req.body.sStatus);
        if (req.body.sStatus === 'Accepted') {
            createResponse(res, httpStatus.OK, 'Request to join tribe has been updated successfully.', follow);
        } else if (req.body.sStatus === 'Rejected') {
            createResponse(res, httpStatus.OK, 'Request to join tribe has been rejected.', follow);
        } else if (req.body.sStatus === 'Cancelled') {
            createResponse(res, httpStatus.OK, 'Your request to join tribe has been Cancelled.', follow);
        }
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const getallRequestedTribes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tribe: any = await authService.getallRequestedTribes(req.query, req.user);
        createResponse(res, httpStatus.OK, Messages.GET_ALL_TRIBE, tribe);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const tribeList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tribe: any = await authService.tribeList(req.query);
        // const tribe: any = await authService.tribeList(req.query, req.user);
        createResponse(res, httpStatus.OK, Messages.GET_ALL_TRIBE, tribe);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const editProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: any = await authService.updateProfile(req.query.id, req.body);
        createResponse(res, httpStatus.OK, Messages.UPDATE_PROFILE, user);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const getCustomerList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customers: any = await authService.getCustomerList(req.query);
        createResponse(res, httpStatus.OK, Messages.GET_CUSTOMER_LIST, customers);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer: any = await authService.updateProfile(req.query.id, req.body);
        if (req.body.sStatus === 'Active') {
            createResponse(res, httpStatus.OK, customer.sFullName ? `"${customer.sFullName}" has been enabled successfully.` : 'user has been enabled successfully.', customer);
        } else if (req.body.sStatus === 'Inactive') {
            createResponse(res, httpStatus.OK, customer.sFullName ? `"${customer.sFullName}" has been disabled successfully.` : 'user has been disabled successfully.', customer);
        } else if (req.body.sStatus === 'Delete') {
            createResponse(res, httpStatus.OK, customer.sFullName ? `"${customer.sFullName}" has been deleted successfully.` : 'user has been deleted successfully.', customer);
        }
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const getFollowing = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const following: any = await authService.getFollowing(req.query, req.user);
        createResponse(res, httpStatus.OK, Messages.GET_FOLLOWING_LIST, following);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const getFollower = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const follower: any = await authService.getFollower(req.query, req.user);
        createResponse(res, httpStatus.OK, Messages.GET_FOLLOWER_LIST, follower);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const getYourTribes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const follower: any = await authService.getYourTribes(req.query, req.user);
        createResponse(res, httpStatus.OK, Messages.GET_TRIBE, follower);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const deleteRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tribe: any = await authService.updateTribe(req.query.id, { sStatus: 'Delete' });
        const tribeRequest: any = await authService.deleteRequests(req.query.id);
        createResponse(res, httpStatus.OK, `Tribe "${tribe.sTitle}" has been successfully deleted.`, tribeRequest);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const getBadges = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const badges: any = await authService.getBadges(req.query.year);
        createResponse(res, httpStatus.OK, `Get Badges SuccessFully.`, badges);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer: any = await authService.updateProfile(req.body.id, { sStatus: req.body.sStatus });
        if (req.body.sStatus === 'Active') {
            createResponse(res, httpStatus.OK, customer.sFullName ? `"${customer.sFullName}" has been enabled successfully.` : 'user has been enabled successfully.', customer);
        } else if (req.body.sStatus === 'Inactive') {
            createResponse(res, httpStatus.OK, customer.sFullName ? `"${customer.sFullName}" has been disabled successfully.` : 'user has been disabled successfully.', customer);
        } else if (req.body.sStatus === 'Delete') {
            createResponse(res, httpStatus.OK, customer.sFullName ? `"${customer.sFullName}" has been deleted successfully.` : 'user has been deleted successfully.', customer);
        }
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const updateStatusPartner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const partner: any = await authService.updateProfilePartner(req.body.id, { sStatus: req.body.sStatus });
        if (req.body.sStatus === 'Active') {
            createResponse(res, httpStatus.OK, partner.sFullName ? `"${partner.sFullName}" has been enabled successfully.` : 'user has been enabled successfully.', partner);
        } else if (req.body.sStatus === 'Inactive') {
            createResponse(res, httpStatus.OK, partner.sFullName ? `"${partner.sFullName}" has been disabled successfully.` : 'user has been disabled successfully.', partner);
        } else if (req.body.sStatus === 'Delete') {
            createResponse(res, httpStatus.OK, partner.sFullName ? `"${partner.sFullName}" has been deleted successfully.` : 'user has been deleted successfully.', partner);
        }
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const refreshTokens = async (req: Request, res: Response) => {
    try {
        const tokens = await authService.refreshAuthTokens(req.body.refreshToken);
        const response = { ...tokens };
        createResponse(res, httpStatus.OK, Messages.REFRESH_TOKEN, {
            tokens: response,
        });
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
}

const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await authService.checkUserById(req.user);
        const customer: any = await authService.changePassword(req.user, req.body, user);
        createResponse(res, httpStatus.OK, Messages.RESET_PASSWORD, customer);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const addTariff = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tariff = await authService.addTariff(req.body);
        createResponse(res, httpStatus.OK, `”${req.body.sTariffName}” has been added successfully.`, tariff);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};
const updateTariff = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sTriffData = req.body.sTriffData;
        console.log(sTriffData, "sTriffData===>");

        const data = sTriffData.map((item: any) => {
            return authService.updateTariff(item.id, { sTriffValue: item.sTriffValue });
        });
        Promise.all(data).then(values => {
            createResponse(res, httpStatus.OK, Messages.TARRIF_UPDATE, values);
        });
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};
const deleteTariff = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tariff = await authService.updateTariff(req.query.id, { sStatus: 'Delete' });
        createResponse(res, httpStatus.OK, Messages.TARRIF_DELETE, tariff);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};
const tariffList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tariff = await authService.tariffList(req.query, req.user);
        createResponse(res, httpStatus.OK, Messages.TARRIF_LIST, tariff);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const getAllTarrif = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const getAllTariff = await authService.getAllTariff(req.query);
        createResponse(res, httpStatus.OK, Messages.FETCHED_TARIFF_DATA, getAllTariff);
    }
    catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {})
    }
}

const getPublicTribes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tariff = await authService.getPublicTribes(req.query, req.user);
        createResponse(res, httpStatus.OK, Messages.GET_ALL_TRIBE, tariff);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const createPartner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const partner: any = await authService.createPartner(req.body);
        createResponse(res, httpStatus.OK, `Partner "${partner.sFulName}" has beeen created successfully.`, partner);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const deletePartner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const partner: any = await authService.deletePartner(req.params.id, { sStatus: 'Delete' });
        createResponse(res, httpStatus.OK, `Partner "${partner.sFulName}" details have been successfully deleted.`, partner);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};


const updatePartner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const partner: any = await authService.updatePartner(req.query.id, req.body)
        createResponse(res, httpStatus.OK, Messages.UPDATE_PARTNER, partner);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product: any = await authService.createProduct(req.body);
        createResponse(res, httpStatus.OK, `Product "${product.sName}" has beeen created successfully.`, product);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const getTribeFollowers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tariff = await authService.getTribeFollowers(req.query);
        console.log(tariff, 'tariff--------');

        createResponse(res, httpStatus.OK, Messages.GET_TRIBE_FOLLOWER, tariff);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer: any = await authService.deleteCustomer(req.params.id, { sStatus: 'Delete' });
        createResponse(res, httpStatus.OK, `Customer "${customer.sEmail}" details have been successfully deleted.`, customer);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};


const getTribeByCustomerDetials = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tribesDetails: any = await authService.getTribeByCustomerDetials(req.params);
        createResponse(res, httpStatus.OK, Messages.GET_TRIBE_DETAILS, tribesDetails);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};


const updateStatusProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product: any = await authService.updateStatusProduct(req.body.id, { sStatus: req.body.sStatus });
        if (req.body.sStatus === 'Active') {
            createResponse(res, httpStatus.OK, product.sName ? `"${product.sName}" has been enabled successfully.` : 'Product has been enabled successfully.', product);
        } else if (req.body.sStatus === 'Inactive') {
            createResponse(res, httpStatus.OK, product.sName ? `"${product.sName}" has been disabled successfully.` : 'Product has been disabled successfully.', product);
        } else if (req.body.sStatus === 'Delete') {
            createResponse(res, httpStatus.OK, product.sName ? `"${product.sName}" has been deleted successfully.` : 'Product has been deleted successfully.', product);
        }
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};


const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product: any = await authService.deleteProduct(req.params.id, { sStatus: 'Delete' });
        createResponse(res, httpStatus.OK, `Product "${product.sName}" details have been successfully deleted.`, product);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const partner: any = await authService.updateProduct(req.query.id, req.body)
        createResponse(res, httpStatus.OK, Messages.UPDATE_PRODUCT, partner);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const getProductCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product: any = await authService.getProductCategoryById(req.params.id)
        createResponse(res, httpStatus.OK, Messages.GET_PRODUCT_DETIALS, product);
    } catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
};

const getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tasks: any = await authService.getTasksByBadgesId(req.params.id, req.user);
        createResponse(res, httpStatus.OK, Messages.FETCHED_TASKS, tasks)
    }
    catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {})
    }
};

const saveTaskAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const saveAnswers = await authService.saveTaskAnswers(req.body);
        createResponse(res, httpStatus.OK, Messages.ANSWERS_SAVED, saveAnswers);
    }
    catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {})
    }
};

const getTaskAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const answers = await authService.getTaskAnswers(req.params.userId, req.params.taskId);
        createResponse(res, httpStatus.OK, Messages.FETCHED_ANSWERS, answers);
    }
    catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {})
    }
};

const updateTaskAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const update = await authService.updateTaskAnswers(req.params.userId, req.params.taskId, req.body);
        createResponse(res, httpStatus.OK, Messages.UPDATED_ANSWERS, update);
    }
    catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {});
    }
}

const getProductByPartnerId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productDetails = await authService.getProductbyPartner(req.params.partnerId);
        createResponse(res, httpStatus.OK, Messages.FOUND_PARTNERWISE_PRODUCT, productDetails);
    }
    catch (error: any) {
        createResponse(res, httpStatus.BAD_REQUEST, error.message, {})
    }
}

export default {
    login,
    userSignup,
    userLogin,
    forgotpassword,
    resetPassword,
    sendVerifyEmail,
    checkLink,
    checkResetLink,
    onBoarding,
    createTribe,
    getTribe,
    deleteTribe,
    updateTribe,
    getallTribes,
    getallPartners,
    followRequest,
    updateRequest,
    updateProfile,
    getallRequestedTribes,
    tribeList,
    editProfile,
    getCustomerList,
    updateCustomer,
    getFollowing,
    getFollower,
    getYourTribes,
    deleteRequests,
    getBadges,
    updateStatus,
    updateStatusPartner,
    refreshTokens,
    changePassword,
    addTariff,
    updateTariff,
    deleteTariff,
    tariffList,
    getPublicTribes,
    getTribeFollowers,
    createPartner,
    deletePartner,
    updatePartner,
    createProduct,
    getallProducts,
    deleteCustomer,
    getTribeByCustomerDetials,
    updateStatusProduct,
    deleteProduct,
    updateProduct,
    getProductCategoryById,
    getTasks,
    saveTaskAnswer,
    getTaskAnswer,
    updateTaskAnswer,
    getProductByPartnerId,
    getAllTarrif
}