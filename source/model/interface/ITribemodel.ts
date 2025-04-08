import { Document } from "mongoose";

export interface ITribeModel extends Document {
    sProfileImage: String,
    oUserId: String,
    sTitle: String,
    sBusinessCategory: String,
    sDescription: String,
    sStatus: {
        type: String,
        enum: ["Active", "Inactive", "Delete"],
        default: "Inactive"
    }
};

export default ITribeModel;