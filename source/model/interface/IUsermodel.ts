import { Document } from "mongoose";
export interface IUserModel extends Document {
    nNo: Number,
    sFullName: String,
    sEmail: String,
    sPassword: String,
    isVerify: {
        type: Boolean,
        default: false
    },
    isOnboarding: {
        type: Boolean,
        default: false
    },
    sUserRole: {
        type: String,
        enum: ["Admin", "User"],
        default: "User"
    },
    sType: String,
    sPhoneCode: String,
    nPhone: Number,
    sLinkdinURL: String,
    sBusinessName: String,
    sBusinessCategory: String,
    nProperySize: Number,
    nEmployee: Number,
    sAddress: String,
    sPostalCode: String,
    sSignupStep: String,
    sStatus: {
        type: String,
        enum: ["Active", "Inactive", "Delete"],
        default: "Inactive"
    },
    sCharities: String
}
export default IUserModel;
