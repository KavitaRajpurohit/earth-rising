import { model, Schema } from "mongoose";
import IBadgesModel from "./../interface/IBadgesmodel";

export type BadgesDocument = IBadgesModel;

const BadgesSchema = new Schema({
    sImage: String,
    sName: String,
    sCertificate: String,
    sDescription: String,
    nPercentage: Number,
    sStatus: {
        type: String,
        enum: ["Active", "Inactive", "Delete"],
        default: "Inactive"
    }
}, {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true },
});

const Badges = model<BadgesDocument>("badges", BadgesSchema);

export default Badges;