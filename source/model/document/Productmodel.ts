import { timeStamp } from "console";
import { model, Schema } from "mongoose";
import IProductModel from "./../interface/IProductmodel";

export type PartnerDocument = IProductModel;

const ProductSchema = new Schema({
    oPartnerId: { type: Schema.Types.ObjectId, required: true },
    sName: String,
    sProductImage: String,
    sCategory: String,
    sDescription: String,
    oUserId: { type: Schema.Types.ObjectId, required: true },
    nPrice:Number,
    isZeroCarbon:Boolean,
    sDiscountCode:String,
    nFootPrint:Number,
    nCarbonPerKG:Number,
    nTarget:Number,
    sPaymentLink:String,
    sRating:Number,
    sStatus: {
        type: String,
        enum: ["Active", "Inactive", "Delete"],
        default: "Active"
    }
}, {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true },
});

const products = model<PartnerDocument>("products", ProductSchema);

export default products;