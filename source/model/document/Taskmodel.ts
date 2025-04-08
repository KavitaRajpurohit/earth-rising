import mongoose, { model, Mongoose, Schema } from "mongoose";
import ITaskModel from "../interface/ITaskmodel";

export type TaskDocument = ITaskModel;

const TaskSchema = new Schema({
    taskName: String,
    badgesId: mongoose.Types.ObjectId
}, {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true },
});

const Tasks = model<TaskDocument>("tasks", TaskSchema);

export default Tasks;
