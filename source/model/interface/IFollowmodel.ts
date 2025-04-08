import { Document } from "mongoose";

export interface IFollowModel extends Document {
    oFollowerId: String,
    oUserId: String,
    oTribeId: String,
    sStatus: {
        type: String,
        enum: ["Requested", "Accepted", "Rejected", "Cancelled","Unfollow"],
        default: "Requested"
    }
};

export default IFollowModel;