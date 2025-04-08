import { Document } from "mongoose";

export interface IFactorModel extends Document {
    sTariffName: String,
    sTriffValue: {
        type: [{
            name: String,
            value: Number,
        }]
    },
    oUserId: String,
    sType: String,
    sStatus: {
        type: String,
        enum: ["Active", "Inactive", "Delete"],
        default: "Inactive"
    }
};

export default IFactorModel;