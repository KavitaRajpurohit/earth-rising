import { model, Schema } from "mongoose";
import IPartnerModel from "./../interface/IPartnermodel";

export type PartnerDocument = IPartnerModel;

const PartnerSchema = new Schema({
    oUserId: { type: Schema.Types.ObjectId, required: true },
    nPartnerNo: Number,
    sFulName: String,
    sEmail: String,
    sPhone: String,
    nCommission: String,
    sPhoneCode: String,
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
    },
}, {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true },
});

const partners = model<PartnerDocument>("partners", PartnerSchema);

export default partners;