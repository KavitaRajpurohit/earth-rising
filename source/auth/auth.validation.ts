import Joi from '@hapi/joi';
import { isJSDocThisTag } from 'typescript';
const login = {
    body: Joi.object().keys({
        sEmail: Joi.string().required(),
        sPassword: Joi.string().required(),
    })
};

const userSignup = {
    body: Joi.object().keys({
        sEmail: Joi.string().required(),
        sPassword: Joi.string().required(),
    })
}

const userLogin = {
    body: Joi.object().keys({
        sEmail: Joi.string().email().required().messages({
            'string.email': 'Are you sure you entered the valid email address?',
            'string.empty': 'Email address cannot be empty.'
        }),
        sPassword: Joi.string().required().messages({
            'string.empty': 'Password cannot be empty.'
        }),
    }),
};

const forgotPassword = {
    body: Joi.object().keys({
        sEmail: Joi.string().email().required().messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email address is required.'
        }),
        sUserRole: Joi.string().required()
    }),
};

const resetPassword = {
    params: Joi.object().keys({
        token: Joi.string().required()
    }),
    body: Joi.object().keys({
        sPassword: Joi.string()
            .required()
            .messages({
                'string.empty': "New password cannot be empty."
            }),
    })
};

const updateProfile = {
    query: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        sProfileImage: Joi.string(),
        sFullName: Joi.string()
    })
};

const update = {
    body: Joi.object().keys({
        sFullName: Joi.string(),
        sType: Joi.string(),
        sPhoneCode: Joi.string(),
        nPhone: Joi.string(),
        sLinkdinURL: Joi.string(),
        sBusinessName: Joi.string(),
        sBusinessCategory: Joi.string(),
        nProperySize: Joi.number(),
        nEmployee: Joi.number(),
        sAddress: Joi.string(),
        sPostalCode: Joi.string(),
        sSignupStep: Joi.string(),
        sStatus: Joi.string(),
        sCharities: Joi.string(),
        isOnboarding: Joi.boolean()
    })
};

const createTribe = {
    body: Joi.object().keys({
        sProfileImage: Joi.string(),
        oUserId: Joi.string(),
        sTitle: Joi.string().required(),
        sBusinessCategory: Joi.string(),
        sDescription: Joi.string(),
        nEmployee:Joi.number()
    })
};

const allTribes = {
    query: Joi.object().keys({
        id: Joi.string().required(),
        search: Joi.string().allow('', null)
    })
};
const allPartners = {
    query: Joi.object().keys({
        search: Joi.string().allow('', null),
        sortBy: Joi.string(),
        page: Joi.number(),
        limit: Joi.number()
    })
};
const allProducts = {
    query: Joi.object().keys({
        search: Joi.string().allow('', null),
        sortBy: Joi.string(),
        page: Joi.number(),
        limit: Joi.number(),
        sCategory: Joi.string(),
        sRating:Joi.string(),
        sDiscountCode:Joi.string(),
        nPrice:Joi.string()

    })
};

const followRequest = {
    body: Joi.object().keys({
        oUserId: Joi.string().required(),
        oFollowerId: Joi.string().required(),
        oTribeId: Joi.string().required()
    })
};

const updateRequest = {
    body: Joi.object().keys({
        sStatus: Joi.string().required().valid("Requested", "Accepted", "Rejected", "Cancelled", "Unfollow"),
        oUserId: Joi.string().required(),
        oFollowerId: Joi.string().required(),
        oTribeId: Joi.string().required()
    })
};

const getallRequestedTribes = {
    query: Joi.object().keys({
        search: Joi.string().allow('', null),
        sortBy: Joi.string(),
        page: Joi.number(),
        limit: Joi.number()
    })
};

const tribeList = {
    query: Joi.object().keys({
        sortBy: Joi.string()
    })
};

const editProfile = {
    query: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        sFullName: Joi.string(),
        nNo: Joi.number(),
        sEmail: Joi.string(),
        sType: Joi.string(),
        sPhoneCode: Joi.string(),
        nPhone: Joi.string(),
        sLinkdinURL: Joi.string(),
        sBusinessName: Joi.string(),
        sBusinessCategory: Joi.string(),
        nProperySize: Joi.number(),
        nEmployee: Joi.number(),
        sAddress: Joi.string(),
        sPostalCode: Joi.string(),
        sCharities: Joi.string(),
        sProfileImage: Joi.string()
    })
};

const getCustomerList = {
    query: Joi.object().keys({
        search: Joi.string(),
        sortBy: Joi.string(),
        page: Joi.string(),
        limit: Joi.string(),
        sType: Joi.string(),
        nPropertiSize: Joi.string()
    })
};

const updateCustomer = {
    query: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        sStatus: Joi.string()
    }),
};

const tribeFollowing = {
    query: Joi.object().keys({
        search: Joi.string(),
        page: Joi.string(),
        limit: Joi.string()
    })
}

const tribeFollower = {
    query: Joi.object().keys({
        search: Joi.string(),
        sortBy: Joi.string(),
        page: Joi.string(),
        limit: Joi.string()
    })
}

const deleteRequests = {
    query: Joi.object().keys({
        id: Joi.string().required()
    })
}

const getBadges = {
    query: Joi.object().keys({
        year: Joi.number()
    })
}

const updateStatus = {
    body: Joi.object().keys({
        id: Joi.string().required(),
        sStatus: Joi.string()
    })
}

const updateStatusPartner = {
    body: Joi.object().keys({
        id: Joi.string().required(),
        sStatus: Joi.string()
    })
}

const refreshTokens = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};
const changePassword = {
    body: Joi.object().keys({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required()
    })
};

const addTariff = {
    body: Joi.object().keys({
        sTariffName: Joi.string(),
        sTriffValue: Joi.array(),
        oUserId: Joi.string(),
        sType: Joi.string().valid("Electricity", "Other"),
        sStatus: Joi.string().valid("Active", "Inactive", "Delete")
    })
};
const updateTariff = {
    body: Joi.object().keys({
        sTriffData: Joi.array().required()
    })
};
const deleteTariff = {
    query: Joi.object().keys({
        id: Joi.string()
    }),
};
const tariffList = {
    query: Joi.object().keys({
        sType: Joi.string().required().valid("Electricity", "Other"),
        search: Joi.string()
    }),
};

const getAllTariff = {
    query: Joi.object().keys({
        sType: Joi.string().required(),
        search: Joi.string()
    })
}

const createPartner = {
    body: Joi.object().keys({
        nPartnerNo: Joi.string(),
        oUserId: Joi.string(),
        sFulName: Joi.string(),
        sEmail: Joi.string(),
        sPhone: Joi.string(),
        nCommission:Joi.string(),
        sAddress:Joi.string(),
        longitude:Joi.string(),
        latitude:Joi.string(),
        nProduct:Joi.number(),
        sPhoneCode:Joi.number(),
    })
};

const createProduct = {
        body: Joi.object().keys({
        oPartnerId: Joi.string(),
        sName: Joi.string(),
        sProductImage: Joi.string(),
        sCategory: Joi.string(),
        sDescription: Joi.string(),
        oUserId: Joi.string(),
        nPrice:Joi.number(),
        isZeroCarbon: Joi.boolean(),
        sDiscountCode:Joi.string(),
        nFootPrint:Joi.number(),
        nCarbonPerKG:Joi.number(),
        nTarget:Joi.number(),
        sPaymentLink:Joi.string(),
        sRating:Joi.number()
     })
};
const updatePartner = {
    query: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        nPartnerNo: Joi.string(),
        oUserId: Joi.string(),
        sFulName: Joi.string().required(),
        sEmail: Joi.string(),
        sPhone: Joi.string(),
        nCommission:Joi.string(),
        sAddress:Joi.string(),
        longitude:Joi.string(),
        latitude:Joi.string(),
        sPhoneCode:Joi.string()
    })
};

const getTribeFollowers = {
    query: Joi.object().keys({
        oTribeId: Joi.string(),
        search: Joi.string(),
        page: Joi.string(),
        limit: Joi.string()
    }),
};

const updateStatusProduct = {
    body: Joi.object().keys({
        id: Joi.string().required(),
        sStatus: Joi.string()
    })
}

const updateProduct = {
    query: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
             oPartnerId: Joi.string(),
            sName: Joi.string(),
            sProductImage: Joi.string(),
            sCategory: Joi.string(),
            sDescription: Joi.string(),
            oUserId: Joi.string(),
            nPrice:Joi.number(),
            isZeroCarbon: Joi.boolean(),
            sDiscountCode:Joi.string(),
            nFootPrint:Joi.number(),
            nCarbonPerKG:Joi.number(),
            nTarget:Joi.number(),
            sPaymentLink:Joi.string(),
            sRating:Joi.number()
    })
};
export default {
    login,
    userSignup,
    userLogin,
    forgotPassword,
    resetPassword,
    update,
    createTribe,
    allTribes,
    allPartners,
    followRequest,
    updateRequest,
    updateProfile,
    getallRequestedTribes,
    tribeList,
    editProfile,
    getCustomerList,
    updateCustomer,
    tribeFollowing,
    tribeFollower,
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
    createPartner,
    updatePartner,
    getTribeFollowers,
    createProduct,
    allProducts,
    updateStatusProduct,
    updateProduct,
    getAllTariff
}
