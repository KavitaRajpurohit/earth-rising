import mongoose, { Document } from "mongoose";

export interface ITaskAnswerModel extends Document {
    badgesId: String,
    taskId: String,
    userId: {
        type: String,
        unique: true
    }
    sStatus: {
        type: String,
        enum: ["Pending", "Requested", "Completed", "Rejected"],
        default: "Pending"
    },
    answers: []
};

export default ITaskAnswerModel;