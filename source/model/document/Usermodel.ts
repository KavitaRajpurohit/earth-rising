import { model, Schema } from "mongoose";
import { pick } from "lodash";
import bcrypt from "bcryptjs";
import IUserModel from "./../interface/IUsermodel";

export type UserDocument = IUserModel;
const UserSchema = new Schema({
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
    nPhone: String,
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
    sCharities: String,
    sProfileImage: String
}, {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true },
});
UserSchema.methods.transform = function () {
    const user = this;
    return pick(user.toJSON(), ['id', 'sFullName', 'nNo', 'sType', 'sEmail', 'sPhoneCode', 'nPhone', 'sLinkdinURL', 'isOnBoarding', 'sProfileImage', 'isVerify', 'sBusinessName', "sSignupStep", "sBusinessCategory", "nProperySize", "nEmployee", "sAddress", "sPostalCode", "sStatus", "sUserRole", "sCharities"]);
};
UserSchema.pre('save', async function (next) {
    const user = this;
    let lasUser = await UserData.findOne({ sUserRole: "User" }, { id: 1, nNo: 1 }).sort({ _id: -1 }).limit(1)
    if (lasUser) {
        let count: any
        count = lasUser.nNo;
        count = count + 1;
        user.nNo = count;
    } else {
        user.nNo = 1;
    }
    user.sPassword = await bcrypt.hash(user.sPassword, 8);

    next();
});
UserSchema.index({ location: '2dsphere' });
const UserData = model<UserDocument>("users", UserSchema);
export default UserData;
