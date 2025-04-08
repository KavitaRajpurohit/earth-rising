import { model, Schema } from "mongoose";
import ITaskAnswerModel from "../interface/ITaskAnswerModel";

export type TaskAnswerDocument = ITaskAnswerModel;

const TaskAnswerSchema = new Schema({
    badgesId: Schema.Types.ObjectId,
    taskId: Schema.Types.ObjectId,
    userId: Schema.Types.ObjectId,
    sStatus: {
        type: String,
        enum: ["Pending", "Requested", "Completed", "Rejected"],
        default: "Pending"
    },
    answers : []
}, {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true },
});

const TaskAnswer = model<TaskAnswerDocument>("taskAnswers", TaskAnswerSchema);

export default TaskAnswer;