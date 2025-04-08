import { model, Schema } from "mongoose";
import ITribeModel from "./../interface/ITribemodel";

export type TribeDocument = ITribeModel;

const TribeSchema = new Schema({
    sProfileImage: String,
    oUserId: { type: Schema.Types.ObjectId, required: true },
    sTitle: String,
    sBusinessCategory: String,
    sDescription: String,
    nEmployee: Number,
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

const Tribes = model<TribeDocument>("tribes", TribeSchema);

export default Tribes;
