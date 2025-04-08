import UserModel from './../model/document/Usermodel'
import mongoose, { AnyArray, ObjectId } from 'mongoose'
import AppError from '../utils/AppError';
import Messages from './../utils/messages';
import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import Tokens from '../model/document/Tokenmdel';
import tokenService from './../services/token_services';
import TOKEN_TYPE from '../config/constant';
import constant from "./../config/constant"
import Tribes from '../model/document/Tribemodel';
import Partners from '../model/document/Partnermodel';
import Products from '../model/document/Productmodel';
import Follows from '../model/document/Followmodel';
import { getQueryOptions } from '../utils/getQueryParams';
import Badges from '../model/document/Badgesmodel';
import Factor from '../model/document/Factormodel';
import Tasks from '../model/document/Taskmodel';
import TaskAnswer from '../model/document/TaskAnswermodel'
import { object } from '@hapi/joi';

const adminlogin = async (email: String, password: String) => {
    let lower = email;
    email = lower.toLowerCase()
    let user = await UserModel.findOne({ sEmail: email, sUserRole: "Admin" })

    if (user) {
        await checkPassword(password, user.sPassword);
        return user
    } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.INVALID);
    }
};

const signupUser = async (email: String, password: String) => {
    let lower = email;
    email = lower.toLowerCase()
    let user = await UserModel.findOne({ sEmail: email, sUserRole: "User" });
    if (user) {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.ALREADY_EXITS);
    }
    let obj = {
        sEmail: email,
        sPassword: password
    }
    return await new UserModel(obj).save();
};

const userLogin = async (email: String, password: String) => {
    let user: any

    let lower = email;
    email = lower.toLowerCase()
    user = await UserModel.findOne({ sEmail: email, sUserRole: "User" })
    if (user) {
        if (user.isOnboarding === true) {
            if (user.sStatus == constant.STATUS.DELETE) {
                throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.ACCOUNT_DELETED);
            }
            if (user.sStatus == constant.STATUS.INACTIVE) {
                throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.ACCOUNT_DEACTIVATED);
            }
            await checkActive(email, "User")
        }
        await checkPassword(password, user.sPassword);
        return user
    } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.INVALID);
    }
}

const checkEmail = async (sEmail: String, sUserRole: String) => {


    let lower = sEmail;
    sEmail = lower.toLowerCase()
    let user = await UserModel.findOne({ sEmail: sEmail, sStatus: { $ne: constant.STATUS.DELETE }, sUserRole: sUserRole })
    if (user) {
        return user
    } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.EMAIL_NOT_FOUND);
    }
};

const checkPassword = async (password: any, correctPassword: any) => {
    const isPasswordMatch = await bcrypt.compare(password, correctPassword);
    if (!isPasswordMatch) {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.INVALID);
    }
};
const checkActive = async (sEmail: String, sUserRole: any) => {
    let user: any;
    user = await UserModel.findOne({ sEmail: sEmail, sUserRole: sUserRole })
    if (user) {
        if (user.sStatus == constant.STATUS.DELETE) {
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.ACCOUNT_DELETED);
        }
        if (user.sStatus == constant.STATUS.INACTIVE) {
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.ACCOUNT_DEACTIVATED);
        }
        return user
    } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.INVALID);
    }
};

const resetPassword = async (resetPasswordToken: any, newPassword: any) => {
    let userId: any;
    const resetPasswordTokenDoc = await tokenService.verifyToken(
        resetPasswordToken,
        constant.TOKEN_TYPE.RESET_PASSWORD

    );
    userId = resetPasswordTokenDoc.sub.user._id;
    let user = await UserModel.findByIdAndUpdate(userId, { sPassword: newPassword }, { new: true });
    await Tokens.deleteOne({ token: resetPasswordToken, type: constant.TOKEN_TYPE.RESET_PASSWORD })
    return user;
};

const checkLinkToken = async (resetPasswordToken: any) => {
    let user: any;
    user = await tokenService.verifyToken(
        resetPasswordToken,
        constant.TOKEN_TYPE.VERIFICATION_TOKEN

    );
    await UserModel.findByIdAndUpdate(user.sub.user._id, { isVerify: true })
    await Tokens.deleteOne({ token: resetPasswordToken, type: constant.TOKEN_TYPE.RESET_PASSWORD })
    user = await UserModel.findById(user.sub.user._id, { sEmail: 1 })
    return user
};

const checkResetLinkToken = async (resetPasswordToken: any) => {
    let user: any;
    user = await tokenService.verifyToken(
        resetPasswordToken,
        constant.TOKEN_TYPE.RESET_PASSWORD

    );
    await UserModel.findByIdAndUpdate(user.sub.user._id, { isVerify: true })
    user = await UserModel.findById(user.sub.user._id, { sEmail: 1 })
    return user
};

const checkVerifyEmail = async (sEmail: String, sUserRole: String) => {
    let lower = sEmail;
    sEmail = lower.toLowerCase()
    let user: any = await UserModel.findOne({ sEmail: sEmail, sStatus: { $ne: constant.STATUS.DELETE }, sUserRole: sUserRole })
    if (!user) {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.EMAIL_NOT_FOUND);
    }
    return user
}

// const userUpdate = async (id: any, body: any) => {
//     const user = await UserModel.findByIdAndUpdate(id, body, { new: true })
//     return user
// };

const onboardingData = async (id: any, body: any) => {
    let user: any = await UserModel.findById(id)
    console.log('user', user);

    if (user.sType) {
        if (user.sType == body.sType) {
            return user
        } else {
            console.log("Data", body);
            if (body.sSignupStep !== "3") {
                let obj = {
                    nPhone: "",
                    sFullName: "",
                    sPhoneCode: "",
                    sLinkdinURL: "",
                    sBusinessName: "",
                    sBusinessCategory: "",
                    nProperySize: "",
                    nEmployee: "",
                    sAddress: "",
                    sPostalCode: "",
                    sSignupStep: "",
                    sCharities: "",
                }
                console.log(id);

                await UserModel.updateOne({ _id: id }, { $unset: obj });
            }

            await UserModel.updateOne({ _id: id }, { $set: body });
            return await UserModel.findById(id)
        }
    } else {
        return await UserModel.findByIdAndUpdate(id, { $set: body }, { new: true });
    }

};

const updateProfile = async (id: any, body: any) => {
    const user: any = await UserModel.findById(id);
    if (user) {
        return await UserModel.findByIdAndUpdate(id, body, { new: true });
    } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.ID_NOT_FOUND);
    }
}

const updateProfilePartner = async (id: any, body: any) => {
    const user: any = await Partners.findById(id);
    if (user) {
        return await Partners.findByIdAndUpdate(id, body, { new: true });
    } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.ID_NOT_FOUND);
    }
}

const createTribe = async (body: any) => {
    const ObjectId = mongoose.Types.ObjectId;
    const title = body.sTitle.trim();
    const employee: any = await UserModel.findById(body.oUserId);
    console.log(body.oUserId, 'employee-----------');

    const lowercaseTribe = body.sTitle.trim().toLowerCase();
    const checkDuplicateTribe = await Tribes.aggregate([
        {
            $match: {
                oUserId: new ObjectId(body.oUserId),
                sStatus: "Active"
            }
        },
        {
            $addFields: { tribeTitle: { $toLower: '$sTitle' } }
        },
        {
            $match: {
                tribeTitle: lowercaseTribe
            }
        }
    ]);
    if (checkDuplicateTribe.length > 0) {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.TRIBE_ALREADY_EXIST);
    } else {
        const tribeBody = body;
        tribeBody['sTitle'] = title;
        tribeBody['nEmployee'] = employee.nEmployee;
        return await Tribes.create(tribeBody);
    }
};

const getTribe = async (id: string) => {
    const tribe = await Tribes.findById(id);
    if (tribe) {
        return tribe;
    } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.TRIBE_NOT_FOUND);
    }
};

const getallTribes = async (id: any, search: any) => {
    const ObjectId = mongoose.Types.ObjectId;
    let searchFilter = {};
    console.log(search)
    if (search) {
        searchFilter = { sTitle: { $regex: search.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), $options: "i" } }
    }
    const followList = await Follows.aggregate([{
        $match: {
            $or: [{
                oUserId: new ObjectId(id)
            }, {
                oFollowerId: new ObjectId(id)
            }],
            sStatus: {
                $in: ['Accepted', 'Requested']
            }
        }
    }])
    const personalTribes = await Tribes.aggregate([
        {
            $match: searchFilter
        },
        {
            $match: {
                oUserId: new ObjectId(id),
                sStatus: { $ne: 'Delete' }
            }
        }
    ]);
    const publicTribes = await Tribes.aggregate([
        {
            $match: searchFilter
        },
        {
            $match: {
                oUserId: { $ne: new ObjectId(id) },
                sStatus: 'Active'
            }
        },
        {
            '$lookup': {
                'from': 'users',
                'localField': 'oUserId',
                'foreignField': '_id',
                'as': 'User'
            }
        }, {
            '$unwind': {
                'path': '$User',
                'preserveNullAndEmptyArrays': true
            }
        }, {
            '$lookup': {
                'from': 'follows',
                'let': {
                    'userId': '$oUserId',
                    "tribeId": "$_id"
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$and': [
                                    {
                                        '$eq': [
                                            '$oFollowerId', '$$userId'
                                        ]
                                    }, {
                                        '$eq': [
                                            '$oUserId', new ObjectId(id)
                                        ]
                                    }, {
                                        '$eq': ['$oTribeId', "$$tribeId"]
                                    }
                                ]
                            }
                        }
                    }
                ],
                'as': 'followed'
            }
        }, {
            '$unwind': {
                'path': '$followed',
                'preserveNullAndEmptyArrays': true
            }
        }, {
            '$match': {
                'followed.sStatus': {
                    '$ne': 'Accepted'
                }
            }
        }, {
            '$addFields': {
                'isRequest': {
                    '$cond': [
                        {
                            '$eq': [
                                '$followed.sStatus', 'Requested'
                            ]
                        }, true, false
                    ]
                }
            }
        }, {
            '$project': {
                'UserName': '$User.sFullName',
                'oUserId': 1,
                'sTitle': 1,
                'sBusinessCategory': 1,
                'sDescription': 1,
                'sStatus': 1,
                'followed': 1,
                'isRequest': 1,
                'sProfileImage': 1
            }
        }
    ]);
    return {
        followCount: followList.length,
        personalTribes,
        publicTribes
    }
};


const getallPartners = async (query: any) => {
    const searchFilter: any = {};
    const { limit, skip, sort, page } = getQueryOptions(query);

    let customFilter: any = {};
    if (query.search) {
        const { search, sort } = query;
        const searchFields = ["sFirstName", "sEmail"];
        searchFilter["$or"] = searchFields.map((field) => ({
            [field]: { $regex: search.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), $options: "i" },
        }));
    }
    const partnes = await Partners.aggregate([
        {
            $match: searchFilter
        },
        {
            $match: {
                sStatus: { $ne: 'Delete' }
            }
        },
        {
            "$project": {
                "sFulName": 1,
                "nPartnerNo": 1,
                "sPhone": 1,
                "nProduct": 1,
                "nCommission": 1,
                "sStatus": 1,

                "loweritem": { "$toLower": "$sFulName" }
            }
        },
        { '$sort': sort },
        //  { "$sort": { "loweritem": 1 } },
        // { '$sort': sort },
        { '$skip': skip },
        { '$limit': limit }
    ]);
    const pNo: any = partnes.map(object => {
        return object.nPartnerNo;
    });

    const max = Math.max(...pNo);

    return {
        totalCount: partnes.length,
        partnerCount: max,
        partnes,
    }
};

const getallProduct = async (query: any) => {
    let searchFilter: any = {};
    let pData: any;
    pData = await Products.find({ sStatus: { $ne: "Delete" } });
    var min = Math.min.apply(null, pData.map((item: any) => { return item.nPrice }));
    var max = Math.max.apply(null, pData.map((item: any) => { return item.nPrice }));

    const { limit, skip, sort, page, sCategory } = getQueryOptions(query);

    let customFilter: any = {};
    if (query.search) {
        const { search, sort } = query;
        const searchFields = ["sName"];
        searchFilter["$or"] = searchFields.map((field) => ({
            [field]: { $regex: search.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), $options: "i" },
        }));
    }


    if (query.sDiscountCode) {
        let discountcodeData = query.sDiscountCode.split(',');
        // let rangeData = query.nPrice.split(',');
        let discountQueryData: any = [];
        if (discountcodeData[0] === "['Y']" || discountcodeData[0] === "['y']" || discountcodeData[0] === '["Y"]' || discountcodeData[0] === '["y"]') {
            discountQueryData = [...discountQueryData, {
                sDiscountCode: { $ne: null }
            }]
        } else {
            discountQueryData = [...discountQueryData, {
                sDiscountCode: { $eq: null }
            }]
        }

        customFilter = { ...customFilter, $or: discountQueryData }
    }


    if (query.nPrice) {
        let rangeData = query.nPrice.split(',');
        let priceQueryData: any = [];
        priceQueryData = [...priceQueryData, {
            $and: [{
                nPrice: {
                    $gte: parseInt(rangeData[0].replace(/[\[\]>'"]+/g, ''))
                }
            }, {
                nPrice: {
                    $lte: parseInt(rangeData[1].replace(/[\[\]>'"]+/g, ''))
                }
            }]
        }]
        customFilter = { ...customFilter, $or: priceQueryData }
        //customFilter = { ...customFilter, sDiscountCode: { $eq: query.sDiscountCode } }
    }

    if (query.sCategory) {
        const type = JSON.parse(query.sCategory);
        customFilter = { ...customFilter, sCategory: { $in: type } }
    }
    if (query.sRating) {
        const dataArray = query.sRating.replace(/[\[\]']+/g, '').split(',')
        if (dataArray.length > 0) {
            let queryData: any = [];
            for (var i = 0; i < dataArray.length; i++) {
                let rangeData = dataArray[i];
                queryData = [...queryData, {
                    $and: [{
                        sRating: {
                            $gte: parseInt(rangeData.replace(/[\[\]>'"]+/g, ''))
                        }
                    }]
                }]
            }
            customFilter = { ...customFilter, $or: queryData }
        }
    }
    const products = await Products.aggregate([
        {
            $match: searchFilter
        },
        {
            $match: customFilter
        },

        {
            $match: {
                sStatus: { $ne: 'Delete' }
            }
        },
        { '$sort': sort },
        { '$skip': skip },
        { '$limit': limit }
    ]);
    return {
        productCount: products.length,
        minPrice: Math.floor(min),
        maxPrice: Math.ceil(max),
        products

    }
}
const updateTribe = async (id: any, body: any) => {
    const tribe: any = await getTribe(id);
    const ObjectId = mongoose.Types.ObjectId;
    if (tribe) {
        if (tribe.sStatus !== 'Delete') {
            const tribeBody = body;
            if (body.sTitle) {
                const title = body.sTitle.trim();
                const lowercaseTribe = body.sTitle.trim().toLowerCase();
                const checkDuplicateTribe = await Tribes.aggregate([
                    {
                        $match: {
                            oUserId: new ObjectId(body.oUserId),
                            _id: { $ne: new ObjectId(tribe._id) },
                            sStatus: { $ne: 'Delete' }
                        }
                    },
                    {
                        $addFields: { tribeTitle: { $toLower: '$sTitle' } }
                    },
                    {
                        $match: {
                            tribeTitle: lowercaseTribe
                        }
                    }
                ]);
                if (checkDuplicateTribe.length > 0) {
                    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.TRIBE_ALREADY_EXIST);
                }
                tribeBody['sTitle'] = title;
            }
            return await Tribes.findByIdAndUpdate(id, tribeBody, { new: true })
        } else {
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.TRIBE_NOT_FOUND);
        }
    }
};

const followRequest = async (body: any) => {
    const checkRequest = await Follows.findOne({ oFollowerId: new Object(body.oFollowerId), oUserId: new Object(body.oUserId), oTribeId: new Object(body.oTribeId) });
    if (checkRequest) {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.REQUEST_ALREADY_SEND);
    } else {
        return await Follows.create(body);
    }
};

const updateRequest = async (body: any, sStatus: string) => {
    const request = await Follows.findOne({ oFollowerId: new Object(body.oFollowerId), oUserId: new Object(body.oUserId), oTribeId: new Object(body.oTribeId) });
    if (request) {
        // return Follows.deleteOne({ _id: request._id })
        if (sStatus === 'Accepted') {
            return await Follows.findByIdAndUpdate(request._id, { sStatus }, { new: true });
        } else {
            return Follows.findByIdAndDelete(request._id, { new: true });
        }
    } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.REQUEST_NOT_FOUND);
    }
};

const getallRequestedTribes = async (query: any, oUserId: any) => {
    let searchFilter: any = {};
    if (query.search) {
        const { search } = query;
        console.log(query.search, 'query.search');
        searchFilter = { tribeName: { $regex: search.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), $options: "i" } }
    }
    const ObjectId = mongoose.Types.ObjectId;
    const { limit, skip, sort, page } = getQueryOptions(query);
    // if (query.search) {
    //     console.log(query.search, 'query.search');

    //     const { search, sort } = query;
    //     const searchFields = ["tribeName"];
    //     searchFilter["$or"] = searchFields.map((field) => ({
    //         [field]: { $regex: search.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), $options: "i" },
    //     }));
    // }
    return await Follows.aggregate([
        {
            '$match': {
                'oFollowerId': new ObjectId(oUserId.user),
                'sStatus': 'Requested'
            }
        },
        // {
        //     $match: searchFilter
        // },
        {
            '$lookup': {
                'from': 'users',
                'localField': 'oUserId',
                'foreignField': '_id',
                'as': 'userData'
            }
        },
        {
            '$unwind': {
                'path': '$userData',
                'preserveNullAndEmptyArrays': true
            }
        },
        {
            '$lookup': {
                'from': 'tribes',
                'localField': 'oTribeId',
                'foreignField': '_id',
                'as': 'tribeData'
            }
        },
        {
            '$unwind': {
                'path': '$tribeData',
                'preserveNullAndEmptyArrays': true
            }
        },
        {
            $addFields: {
                userName: "$userData.sFullName",
                tribeName: "$tribeData.sTitle",
            }
        },
        // { 
        //     '$match': {
        //     'tribeName': tribe
        //     }
        // },
        //  {
        //     '$project': {
        //         'oFollowerId': 1,
        //         'oUserId': 1,
        //         'oTribeId': 1,
        //         'sStatus': 1,
        //         'createdAt': 1,
        //         'updatedAt': 1,
        //         'userName': '$userData.sFullName'
        //     }
        // },
        {
            $match: searchFilter
        },
        { '$sort': sort },
        { '$skip': skip },
        { '$limit': limit },

    ]);
};

// const tribeList = async (query: any, oUserId: any) => {
const tribeList = async (query: any) => {
    const ObjectId = mongoose.Types.ObjectId;
    const { limit, skip, sort, page, tribe } = getQueryOptions(query);
    return await Tribes.aggregate([
        {
            $match: {
                // oUserId: new ObjectId(oUserId.user),
                sStatus: "Active",
                sName: tribe
            }
        },
        {
            '$lookup': {
                'from': 'follows',
                'let': {
                    'id': '$_id'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$and': [
                                    {
                                        '$eq': [
                                            '$oTribeId', '$$id'
                                        ]
                                    }, {
                                        '$eq': [
                                            '$sStatus', 'Accepted'
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                'as': 'Tribes'
            }
        },
        {
            '$addFields': {
                'TribeCounts': {
                    '$size': '$Tribes'
                }
            }
        },
        {
            $sort: sort
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        },
    ])
};

const getCustomerList = async (query: any) => {
    const searchFilter: any = {};
    let customFilter: any = {};
    if (query.search) {
        const { search } = query;
        const searchFields = ["sFullName", "sEmail"];
        searchFilter["$or"] = searchFields.map((field) => ({
            [field]: { $regex: search.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), $options: "i" },
        }));
        console.log(searchFilter);
    }
    if (query.nPropertiSize) {

        const dataArray = query.nPropertiSize.replace(/[\[\]']+/g, '').split(',')
        if (dataArray.length > 0) {
            let queryData: any = [];
            dataArray.map((item: string) => {
                let rangeData = item.split('-');
                if (rangeData[1]) {
                    queryData = [...queryData, {
                        $and: [{
                            nProperySize: {
                                $gt: parseInt(rangeData[0].replace(/[\[\]>'"]+/g, ''))
                            }
                        }, {
                            nProperySize: {
                                $lt: parseInt(rangeData[1].replace(/[\[\]>'"]+/g, ''))
                            }
                        }]
                    }]
                } else {
                    queryData = [...queryData, {
                        $and: [{
                            nProperySize: {
                                $gt: parseInt(rangeData[0].replace(/[\[\]>'"]+/g, ''))
                            }
                        }]
                    }]
                }
            });
            customFilter = { ...customFilter, $or: queryData }
        }
    }

    if (query.sType) {
        const type = JSON.parse(query.sType);
        customFilter = { ...customFilter, sType: { $in: type } }
    }
    const { limit, skip, sort, page } = getQueryOptions(query);
    return await UserModel.aggregate([
        {
            $match: {
                sUserRole: 'User',
                sStatus: { $ne: 'Delete' }
            }
        },
        {
            $match: searchFilter
        },
        {
            $match: customFilter
        },
        // {
        //      "$project":
        // {
        //     "sFullName": 1,
        //     "loweritem": { "$toLower": "$sFullName" }
        //  }},
        //  { "$sort": { "loweritem": 1 } },

        // {
        //     $addFields: {
        //        "specs.fuel_type": "unleaded"
        //     }
        //  },
        //{  '$sort': { sFullName: -1,  } },
        {
            "$project": {
                "sFullName": 1,
                "sAddress": 1,
                "sEmail": 1,
                "nPhone": 1,
                "sType": 1,
                "nProperySize": 1,
                "sStatus": 1,

                "loweritem": { "$toLower": "$sFullName" },
                "loweritem1": { "$toLower": "$sAddress" }
            }
        },
        //{ "$sort": { "loweritem": 1 } },
        { '$sort': sort },
        { '$skip': skip },
        { '$limit': limit }
    ])
};

const getFollowing = async (query: any, oUserId: any) => {
    const ObjectId = mongoose.Types.ObjectId;
    let searchFilter: any = {};
    if (query.search) {
        const { search } = query;
        searchFilter = { tribeName: { $regex: search.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), $options: "i" } }
    }
    const { limit, skip, sort, page } = getQueryOptions(query);
    return await Follows.aggregate(
        [
            {
                $match: {
                    oUserId: new ObjectId(oUserId.user)
                }
            },
            {
                '$lookup': {
                    'from': 'tribes',
                    'let': {
                        'id': '$oTribeId'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$and': [
                                        {
                                            '$eq': [
                                                '$_id', '$$id'
                                            ]
                                        }, {
                                            '$ne': [
                                                '$sStatus', 'Delete'
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    'as': 'tribe'
                }
            }, {
                '$unwind': {
                    'path': '$tribe',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'oFollowerId',
                    'foreignField': '_id',
                    'as': 'userData'
                }
            }, {
                '$unwind': {
                    'path': '$userData',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$addFields': {
                    'userName': '$userData.sFullName',
                    'tribeName': '$tribe.sTitle'
                }
            },
            {
                $match: searchFilter
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ])
}

const getFollower = async (query: any, oUserId: any) => {
    const ObjectId = mongoose.Types.ObjectId;
    let searchFilter: any = {};
    if (query.search) {
        const { search } = query;
        searchFilter = { tribeName: { $regex: search.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), $options: "i" } }
    }
    const { limit, skip, sort, page } = getQueryOptions(query);
    return await Follows.aggregate(
        [
            {
                $match: {
                    oFollowerId: new ObjectId(oUserId.user)
                }
            },
            {
                '$lookup': {
                    'from': 'tribes',
                    'let': {
                        'id': '$oTribeId'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$and': [
                                        {
                                            '$eq': [
                                                '$_id', '$$id'
                                            ]
                                        }, {
                                            '$ne': [
                                                '$sStatus', 'Delete'
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    'as': 'tribe'
                }
            },
            {
                '$unwind': {
                    'path': '$tribe',
                    'preserveNullAndEmptyArrays': false
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'oUserId',
                    'foreignField': '_id',
                    'as': 'userData'
                }
            },
            {
                '$unwind': {
                    'path': '$userData',
                    'preserveNullAndEmptyArrays': true
                }
            },
            {
                '$addFields': {
                    'userName': '$userData.sFullName',
                    'tribeName': '$tribe.sTitle'
                }
            },
            {
                $match: searchFilter
            },
            {
                $sort: sort
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ])
};
const getYourTribes = async (query: any, oUserId: any) => {
    const ObjectId = mongoose.Types.ObjectId;
    let searchFilter: any = {};
    if (query.search) {
        const { search } = query;
        searchFilter = { sTitle: { $regex: search.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), $options: "i" } }
    }
    const { limit, skip, sort, page } = getQueryOptions(query);
    return await Tribes.aggregate(
        [
            {
                $match: searchFilter
            },
            {
                $match: {
                    oUserId: new ObjectId(oUserId.user),
                    sStatus: "Active"
                }
            },
            {
                '$lookup': {
                    'from': 'follows',
                    'let': {
                        'id': '$_id'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$and': [
                                        {
                                            '$eq': [
                                                '$$id', '$oTribeId'
                                            ]
                                        }, {
                                            '$eq': [
                                                '$sStatus', 'Accepted'
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    'as': 'AcceptedTribes'
                }
            },
            {
                '$addFields': {
                    'AcceptedTribeCounts': {
                        '$size': '$AcceptedTribes'
                    }
                }
            },
            {
                '$lookup': {
                    'from': 'follows',
                    'let': {
                        'id': '$_id'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$and': [
                                        {
                                            '$eq': [
                                                '$$id', '$oTribeId'
                                            ]
                                        }, {
                                            '$eq': [
                                                '$sStatus', 'Requested'
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    'as': 'RequestedTribes'
                }
            },
            {
                '$addFields': {
                    'RequestedTribeCounts': {
                        '$size': '$RequestedTribes'
                    }
                }
            },
            {
                $sort: sort
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ]
    )
};

const deleteRequests = async (query: any) => {
    const ObjectId = mongoose.Types.ObjectId;
    return await Follows.deleteMany({
        oTribeId: new ObjectId(query)
    });
};
const getBadges = async (year: any) => {
    const dateFilter: any = {};
    if (year) {
        dateFilter.year = year
    }
    return await Badges.aggregate([
        {
            $addFields: {
                year: {
                    $year: '$dtCreatedDate'
                }
            }
        },
        {
            $match: dateFilter
        }
    ]);
};
const refreshAuthTokens = async (refreshToken: any) => {
    try {
        const refreshTokenDoc = await tokenService.refreshVerifyToken(refreshToken, constant.TOKEN_TYPE.REFRESH_TOKEN);
        const userId = refreshTokenDoc.sub.user;
        let user = await UserModel.findOne({ _id: userId })
        await Tokens.deleteOne({ token: refreshToken });
        return await tokenService.generateAuthTokens(user?._id, user?.sUserRole)
    } catch (error) {
        throw new AppError(httpStatus.UNAUTHORIZED, Messages.INVALIDTOKEN);
    }
};

const checkUserById = async (body: any) => {
    const user = await UserModel.findById(body.user);
    if (user) {
        return user;
    } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.ID_NOT_FOUND);
    }
};

const changePassword = async (userId: any, body: any, user: any) => {
    const checkPassword = await bcrypt.compare(body.oldPassword, user.sPassword);
    if (checkPassword) {
        const hashPassword = await bcrypt.hash(body.newPassword, 8);
        return await updateProfile(userId.user, { sPassword: hashPassword });
    } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.PASSWORD_INCORRECT);
    }
};

const addTariff = async (body: any) => {
    return await Factor.create(body);
};

const updateTariff = async (id: any, body: any) => {
    const tariff: any = await Factor.findById(id);
    console.log('id', id);

    if (tariff) {
        return await Factor.findByIdAndUpdate({ _id: id }, body, { new: true });
    } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, 'Sorry, we couldn’t find any tariff associated with this Id.');
    }
};

const tariffList = async (query: any, oUserId: any) => {
    const ObjectId = mongoose.Types.ObjectId;
    let customFilter: any = {
        sType: query.sType,
        sStatus: 'Active',
    };
    if (query.sType !== "Other") {
        customFilter.oUserId = new ObjectId(oUserId.user)
    }
    if (query.search) {
        const { search } = query;
        customFilter = { ...customFilter, sTariffName: { $regex: search.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), $options: "i" } }
    }
    return await Factor.aggregate([{
        $match: customFilter
    }])
};

const getAllTariff = async (query: any) => {
    let customFilter: any = {
        sType: query.sType,
        sStatus: 'Active',
    };
    if (query.search) {
        const { search } = query;
        customFilter = { ...customFilter, sTariffName: { $regex: search.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), $options: "i" } }
    }

    return await Factor.aggregate([{
        $match: customFilter
    }])

};

const getPublicTribes = async (query: any, oUserId: any) => {
    const ObjectId = mongoose.Types.ObjectId;
    let searchFilter: any = {};
    const customFilter: any = {
        sStatus: 'Active',
        oUserId: { $ne: new ObjectId(oUserId.user) },
    };
    if (query.search) {
        const { search } = query;
        const searchFields = ["sTitle", "UserName"];
        searchFilter["$or"] = searchFields.map((field) => ({
            [field]: { $regex: search.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), $options: "i" },
        }));
    }
    const { limit, skip, sort, page } = getQueryOptions(query);
    const followList = await Follows.aggregate([{
        $match: {
            oUserId: new ObjectId(oUserId.user),
            sStatus: {
                $in: ['Requested']
            }
        }
    }]);
    const publicTribes = await Tribes.aggregate(
        [
            {
                $match: customFilter
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'oUserId',
                    'foreignField': '_id',
                    'as': 'User'
                }
            }, {
                '$unwind': {
                    'path': '$User',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$lookup': {
                    'from': 'follows',
                    'let': {
                        'userId': '$oUserId',
                        "tribeId": "$_id"
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$and': [
                                        {
                                            '$eq': [
                                                '$oFollowerId', '$$userId'
                                            ]
                                        }, {
                                            '$eq': [
                                                '$oUserId', new ObjectId(oUserId.user)
                                            ]
                                        }, {
                                            '$eq': ['$oTribeId', "$$tribeId"]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    'as': 'followed'
                }
            }, {
                '$unwind': {
                    'path': '$followed',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$match': {
                    'followed.sStatus': {
                        '$ne': 'Accepted'
                    }
                }
            }, {
                '$addFields': {
                    'isRequest': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$followed.sStatus', 'Requested'
                                ]
                            }, true, false
                        ]
                    }
                }
            },
            {
                '$project': {
                    'UserName': '$User.sFullName',
                    'oUserId': 1,
                    'sTitle': 1,
                    'sBusinessCategory': 1,
                    'sDescription': 1,
                    'sStatus': 1,
                    'followed': 1,
                    'isRequest': 1,
                    'sProfileImage': 1
                }
            },
            {
                $match: searchFilter
            },
            {
                $sort: sort
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
        ]);
    return {
        followCount: followList.length,
        publicTribes
    };
}

const createPartner = async (body: any) => {
    const partnerBody = body;
    partnerBody['location'] = {
        "type": "Point",
        "coordinates": [
            body.longitude,
            body.latitude
        ]
    }
    let buyer = await Partners.findOne({ sEmail: partnerBody.sEmail, sStatus: { $ne: "Delete" } })
    if (buyer) {
        throw new AppError(httpStatus.BAD_REQUEST, Messages.ALREADY_EXITS);
    }
    let pData = await Partners.find({ sStatus: { $ne: "Delete" } })
    const pNos: any = pData.map(object => {
        return object.nPartnerNo;
    });
    const max = Math.max(...pNos);
    partnerBody.nPartnerNo = max + 1;
    return await Partners.create(partnerBody);
};

const deletePartner = async (id: any, body: any) => {
    return await Partners.findByIdAndUpdate(id, { sStatus: 'Delete' })

};

const deleteCustomer = async (id: any, body: any) => {
    return await UserModel.findByIdAndUpdate(id, { sStatus: 'Delete' })
};


const updatePartner = async (id: any, body: any) => {
    let partnerDetails = await Partners.findOne({ sEmail: body.sEmail, sStatus: { $ne: "Delete" }, _id: { $ne: id } })
    if (partnerDetails) {
        throw new AppError(httpStatus.BAD_REQUEST, Messages.ALREADY_EXITS);
    }
    const partner: any = await Partners.findById(id);
    if (partner) {
        return await Partners.findByIdAndUpdate(id, body, { new: true });
    } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.ID_NOT_FOUND);
    }
}

const getPartner = async (id: string) => {
    const partner = await Partners.findById(id);
    if (partner) {
        return partner;
    } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.PARTNER_NOT_FOUND);
    }
};


const createProduct = async (body: any) => {
    const productBody = body;
    let product = await Products.findOne({ sName: productBody.sName, oUserId: productBody.oUserId, sStatus: { $ne: "Delete" } })
    if (product) {
        throw new AppError(httpStatus.BAD_REQUEST, Messages.ALREADY_EXITS_PRODUCT);
    }
    let partnerDetails = await Partners.findOne({ _id: productBody.oPartnerId, sStatus: { $ne: "Delete" } })
    if (partnerDetails) {
        let count: any
        count = partnerDetails.nProduct;
        count = count + 1;
        var partnerD = { "nProduct": count }
        await Partners.findByIdAndUpdate(partnerDetails._id, partnerD, { new: true });
        return await Products.create(productBody);
    }
};


const getTribeFollowers = async (query: any) => {
    const ObjectId = mongoose.Types.ObjectId;
    const { limit, skip, sort, page } = getQueryOptions(query);
    let searchFilter: any = {};
    if (query.search) {
        const { search } = query;
        searchFilter = { ...searchFilter, sUserName: { $regex: search.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), $options: "i" } }
    }
    return Tribes.aggregate([
        {
            '$match': {
                '_id': new ObjectId(query.oTribeId)
            }
        }, {
            '$lookup': {
                'from': 'follows',
                'let': {
                    'id': '$_id',
                    'userId': '$oUserId'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$and': [
                                    {
                                        '$eq': [
                                            '$oTribeId', '$$id'
                                        ]
                                    }, {
                                        '$eq': [
                                            '$sStatus', 'Accepted'
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        '$lookup': {
                            'from': 'users',
                            'localField': 'oUserId',
                            'foreignField': '_id',
                            'as': 'userData'
                        }
                    },
                    {
                        $unwind: {
                            path: "$userData",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $addFields: { sUserName: '$userData.sFullName' }
                    },
                    {
                        $match: searchFilter
                    },
                    {
                        $skip: skip
                    },
                    {
                        $limit: limit
                    }
                ],
                'as': 'folowed'
            }
        }
    ]);
};


const getTribeByCustomerDetials = async (params: any) => {
    const ObjectId = mongoose.Types.ObjectId;
    const tribesDetails = await Tribes.aggregate(
        [
            {
                '$match': {
                    'oUserId': new ObjectId(params.id),
                    'sStatus': { $ne: 'Delete' }
                }
            },
            {
                '$lookup': {
                    'from': 'follows',
                    'localField': '_id',
                    'foreignField': 'oTribeId',
                    'as': 'follows'
                }
            },
            {
                '$match': {
                    'follows.sStatus': {
                        '$eq': 'Accepted'
                    }
                }
            },
            {
                '$project': {
                    // 'follows': '$follows',
                    'sTitle': '$sTitle',
                    'sBusinessCategory': '$sBusinessCategory',
                    'sDescription': '$sDescription',
                    'sProfileImage': 1,
                    'memberCount': { $size: '$follows' }
                }
            },
        ]);
    return {
        tribesDetails
    }
};

const updateStatusProduct = async (id: any, body: any) => {
    const product: any = await Products.findById(id);
    if (product) {
        return await Products.findByIdAndUpdate(id, body, { new: true });
    } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.ID_NOT_FOUND);
    }
}

const deleteProduct = async (id: any, body: any) => {
    return await Products.findByIdAndUpdate(id, { sStatus: 'Delete' })
};

const updateProduct = async (id: any, body: any) => {
    let productDetails = await Products.findOne({ sName: body.sName, oUserId: body.oUserId, sStatus: { $ne: "Delete" }, _id: { $ne: id } })
    if (productDetails) {
        throw new AppError(httpStatus.BAD_REQUEST, Messages.ALREADY_EXITS);
    }
    const product: any = await Products.findById(id);
    if (product) {
        return await Products.findByIdAndUpdate(id, body, { new: true });
    } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.ID_NOT_FOUND);
    }
}
const getProductCategoryById = async (id: any) => {
    let pData: any
    pData = await Products.find({ _id: id, sStatus: { $ne: "Delete" } });
    if (pData.length > 0) {
        let category: any
        category = pData[0].sCategory;
        return await Products.find({ sCategory: category, sStatus: { $ne: "Delete" }, _id: { $ne: id } }).sort({ createdAt: -1 });
    } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.PRODUCT_NOT_FOUND);
    }
}

const getTasksByBadgesId = async (id: any, user: any) => {
    let tasksData: any;
    const ObjectId = mongoose.Types.ObjectId;
    let userId = new ObjectId(user.user);
    tasksData = await Tasks.find({ badgesId: id });
    let taskStatus = await Tasks.aggregate(
        [
            {
                '$match': {
                    'badgesId': new ObjectId(id),
                }
            },
            {
                '$lookup': {
                    'from': 'taskanswers',
                    'localField': '_id',
                    'foreignField': 'taskId',
                    'as': 'task_data'
                }
            },
            {
                $unwind: {
                    path: "$task_data",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                '$match': {
                    'task_data.userId': {
                        '$eq': userId
                    }
                }
            },
            {
                '$project': {
                    '_id': 1,
                    'taskName': 1,
                    'badgesId': 1,
                    'task_data.sStatus': 1
                }
            },
        ]);

    if (tasksData && taskStatus) {
        return {
            tasksData,
            taskStatus
        };
    }
    else if (tasksData && !taskStatus) {
        return tasksData
    }
    else if (!tasksData && taskStatus) {
        return taskStatus
    }
    else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.TASKS_NOT_FOUND);
    }
}

const saveTaskAnswers = async (obj: any) => {
    return await new TaskAnswer(obj).save();
}

const getTaskAnswers = async (userId: any, taskId: any) => {
    let answers = await TaskAnswer.find({ userId: userId, taskId: taskId });
    if (answers) {
        return answers;
    }
    else {
        throw new AppError(httpStatus.BAD_REQUEST, Messages.ANSWERS_NOT_FOUND);
    }
};

const updateTaskAnswers = async (userId: any, taskId: any, Obj: any) => {
    let update = await TaskAnswer.findOneAndUpdate({ userId: userId, taskId: taskId }, Obj);
    let updatedAnswers = await TaskAnswer.find({ userId: userId, taskId: taskId })
    if (updatedAnswers) {
        return updatedAnswers
    }
    else {
        throw new AppError(httpStatus.BAD_REQUEST, Messages.ANSWERS_NOT_FOUND);
    }
};

const getProductbyPartner = async (partnerId: any) => {
    const ObjectId = mongoose.Types.ObjectId;
    let findProductByPartner = await Products.find({
        oPartnerId: new ObjectId(partnerId),
        sStatus: "Active"
    });
    if (findProductByPartner) {
        return {
            products: findProductByPartner,
            numberOfProducts: findProductByPartner.length
        };
    }
    else {
        throw new AppError(httpStatus.BAD_REQUEST, Messages.NO_PRODUCT_FOR_PARTNER);
    }
}


export default {
    adminlogin,
    signupUser,
    userLogin,
    checkEmail,
    resetPassword,
    checkVerifyEmail,
    checkLinkToken,
    // userUpdate,
    onboardingData,
    createTribe,
    getTribe,
    updateTribe,
    getallTribes,
    followRequest,
    updateRequest,
    updateProfile,
    updateProfilePartner,
    getallRequestedTribes,
    tribeList,
    getCustomerList,
    getFollowing,
    getFollower,
    getYourTribes,
    deleteRequests,
    getBadges,
    changePassword,
    checkUserById,
    refreshAuthTokens,
    addTariff,
    updateTariff,
    tariffList,
    getPublicTribes,
    getTribeFollowers,
    createPartner,
    deletePartner,
    updatePartner,
    getPartner,
    getallPartners,
    createProduct,
    getallProduct,
    checkResetLinkToken,
    deleteCustomer,
    getTribeByCustomerDetials,
    updateStatusProduct,
    deleteProduct,
    updateProduct,
    getProductCategoryById,
    getTasksByBadgesId,
    saveTaskAnswers,
    getTaskAnswers,
    updateTaskAnswers,
    getProductbyPartner,
    getAllTariff
}