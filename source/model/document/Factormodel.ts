import { model, Schema } from "mongoose";
import IFactorModel from "./../interface/IFactormodel";

export type FactorDocument = IFactorModel;

const FactorSchema = new Schema({
    sTariffName: String,
    sTriffValue: {
        type: [{
            name: String,
            value: {
                type: Number,
                default: 0
            },
            _id: false
        }]
    },
    oUserId: Schema.Types.ObjectId,
    sType: {
        type: String,
        enum: ["Electricity", "Other"]
    },
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

const Factor = model<FactorDocument>("factor", FactorSchema);

export default Factor;