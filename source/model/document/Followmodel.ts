import { model, Schema } from "mongoose";
import IFollowModel from "./../interface/IFollowmodel";

export type FollowDocument = IFollowModel;

const FollowSchema = new Schema({
    oFollowerId: { type: Schema.Types.ObjectId, required: true },
    oUserId: { type: Schema.Types.ObjectId, required: true },
    oTribeId: { type: Schema.Types.ObjectId, required: true },
    sStatus: {
        type: String,
        enum: ["Requested", "Accepted", "Rejected", "Cancelled", "Unfollow"],
        default: "Requested"
    }
}, {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true },
});

const Follow = model<FollowDocument>("follow", FollowSchema);

export default Follow;