import mongoose, { Document } from "mongoose";

export interface ITaskModel extends Document {
    taskName: String,
    badgesId: mongoose.Types.ObjectId
};

export default ITaskModel;