const createResponse = (res: any, status: any, message: any, payload: any) => {
	return res.status(status).json({
		status: status,
		message: message,
		payload: payload
	});
};
export default createResponse