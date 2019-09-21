const express = require('express');
const route = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const jwtSecret = config.get('jsonSecret');
const UserModel = require('../../model/User');
const auth = require('../../middleware/auth');
// ===================================================================

//@Route            POST  api/auth
//@description      Login Api
//@Access           Public

route.post(
	'/',
	[ check('email', 'Enter Valid Email').isEmail(), check('password', 'Enter Valid Password').not().isEmpty() ],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			const exist = await UserModel.findOne({ email });
			if (!exist) {
				return res.status(400).json({ errors: [ { msg: 'Invalid Credentials' } ] });
			}

			const comparePassword = await bcrypt.compare(password, exist.password);

			if (!comparePassword) {
				return res.status(400).json({ errors: [ { msg: 'Invalid Credentials' } ] });
			}
			const payload = { userId: exist.id };
			console.log(payload);
			jwt.sign(payload, jwtSecret, { expiresIn: 3600 }, (err, token) => {
				if (err) throw err;
				res.json({ token });
			});
		} catch (error) {
			console.error(error.message);
			res.status(500).json({
				errors: [ { msg: error.message } ]
			});
		}
	}
);

// ===================================================================

//@Route    GET     api/auth
//@Description      Get User
//@Access           Private

route.get('/', [ auth ], async (req, res) => {
	const { userId } = req;
	try {
		const user = await UserModel.findById(userId).select('-password');
		res.json(user);
	} catch (error) {
		res.status(500).json({ errors: [ { msg: error.message } ] });
	}
});

// ===================================================================
module.exports = route;
