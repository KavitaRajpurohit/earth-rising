import { Document } from "mongoose";

export interface IPartnerModel extends Document {
    oUserId: String,
    nPartnerNo: Number,
    sFulName: String,
    sEmail: String,
    sPhone: String,
    nCommission: String,
    sStatus: {
        type: String,
        enum: ["Active", "Inactive", "Delete"],
        default: "Inactive"
    },
    sAddress: String,
    nProduct:Number,
    location: {
        type: {
            type: String,
            enum: ['Point'], // 'location.type' must be 'Point'
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },};

export default IPartnerModel;