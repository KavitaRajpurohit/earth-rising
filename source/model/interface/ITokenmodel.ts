import { Document } from "mongoose";
export interface ITokenModel extends Document {
    token: String,
    type: Number,
    expiresAt: String,
    user: String
}
export default ITokenModel;
