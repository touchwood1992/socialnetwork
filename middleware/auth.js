const jwt = require('jsonwebtoken');
const config = require('config');
const jwtSecret = config.get('jsonSecret');
const UserModel = require('../model/User');
module.exports = async (req, res, next) => {
	const token = req.headers['x-auth-token'];
	if (!token) {
		return res.status(401).json({ errors: [ { msg: 'Token Missing' } ] });
	}
	try {
		const payload = jwt.verify(token, jwtSecret);

		//Check user exist in database
		const user = await UserModel.findById(payload.userId).select('-password');
		if (!user) {
			return res.status(404).json({ errors: [ { msg: 'Bad Request' } ] });
		}

		req.userId = payload.userId;
		next();
	} catch (error) {
		res.status(500).json({ errors: [ { msg: error.message } ] });
	}
};
