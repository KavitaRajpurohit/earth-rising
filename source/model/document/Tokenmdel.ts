
import { model, Schema } from "mongoose";
import constant from "./../../config/constant"
import ITokenModel from "./../interface/ITokenmodel";
var tokensSchema = new Schema({
	token: { type: String, required: true, index: true, },
	type: {
		type: Number,
		required: true,
		enum: [
			constant.TOKEN_TYPE.ACCESS_TOKEN,
			constant.TOKEN_TYPE.REFRESH_TOKEN,
			constant.TOKEN_TYPE.VERIFICATION_TOKEN,
			constant.TOKEN_TYPE.RESET_PASSWORD
		]
	},
	expiresAt: { type: String, required: true },
	user: { type: Schema.Types.ObjectId, required: true }
}, {
	timestamps: true,
	toObject: { getters: true },
	toJSON: { getters: true },
});
const Tokens = model<ITokenModel>("tokens", tokensSchema);

export default Tokens