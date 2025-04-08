import { Document } from "mongoose";

export interface IProductModel extends Document {
    oPartnerId: String,
    sName: String,
    sProductImage: String,
    sCategory: String,
    sDescription: String,
    oUserId: String,
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
        default: "Inactive"
    }
};

export default IProductModel;