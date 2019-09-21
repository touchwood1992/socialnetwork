const express = require('express');
const route = express.Router();
const { check, validationResult } = require('express-validator');

const UserModel = require('../../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const jwtSecret = config.get('jsonSecret');

const auth = require('../../middleware/auth');
// ===================================================================
//@route        POST api/user
//@desc         Signup users
//@access       Public

route.post(
	'/',
	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Email is required').isEmail(),
		check('password', 'Password required minimum 6 digits').isLength({ min: 6 })
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;
		try {
			const userExist = await UserModel.findOne({ email });
			if (userExist) {
				return res.status(400).json({ errors: [ { msg: 'Email Already Exists' } ] });
			}

			const user = new UserModel({ name, email, password });
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);
			user.save();

			const payload = { userId: user.id };
			jwt.sign(payload, jwtSecret, { expiresIn: 3600 }, function(err, token) {
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

//@Route 			DELETE 	api/user
//@Description		Delete User
//@access 			Private

route.delete('/', auth, async (req, res) => {
	try {
		const { userId } = req;
		await UserModel.findByIdAndDelete(userId);
		res.json({ msg: 'User Deleted Successfully.' });
	} catch (error) {
		console.error(error.message);
		res.status(500).json({
			errors: [ { msg: error.message } ]
		});
	}
});
// ===================================================================
//@Route			PUT		api/user
//@Description		Update User
//@access			Private
route.put(
	'/',
	[
		auth,
		[
			check('name', 'Name is required').not().isEmpty(),
			check('email', 'Email is required').isEmail(),
			check('password', 'Password should be minimum 6 characters').isLength({ min: 6 })
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		const { userId } = req;
		const { name, email, password } = req.body;

		try {
			//check email already exist
			//const existEmail = await UserModel.findOne({ _id: { $ne: userId }, email });
			const reg = new RegExp('^' + name + '$', 'i');
			const existEmail = await UserModel.findOne({
				_id: { $ne: userId },
				email

				//name: new RegExp('^' + name + '$', 'i')
			});

			if (existEmail) {
				return res.status(400).json({
					errors: [ { msg: 'Email Alredy Exists' } ]
				});
			}

			//password hash
			const salt = await bcrypt.genSalt(10);
			const newPasswordhash = await bcrypt.hash(password, salt);

			//finallyUpdate Record
			const updatedOne = await UserModel.findByIdAndUpdate(
				{ _id: userId },
				{ $set: { name, email, password: newPasswordhash } },
				{ new: true }
			);
			res.json(updatedOne);
		} catch (error) {
			console.error(error.message);
			res.status(500).json({
				errors: [ { msg: error.message } ]
			});
		}
	}
);
// ===================================================================
module.exports = route;
