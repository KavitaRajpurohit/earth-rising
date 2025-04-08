import { Document } from "mongoose";

export interface IBadgesModel extends Document {
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
};

export default IBadgesModel;