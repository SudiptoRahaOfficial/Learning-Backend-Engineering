// importing dependencis
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')

// controller for signup post route
async function signupPostController(req, res) {
	// extracting all data sent by client
	const { username, email, password, role = 'user' } = req.body

	try {
		// throwing error on duplicate username/email
		const isUserAlreadyExists = await userModel.findOne({
			$or: [{ username }, { email }],
		})
		if (isUserAlreadyExists) {
			return res.status(409).json({ message: 'User already exists' })
		}

		// encripting password
		const hashedPassword = await bcrypt.hash(password, 10)

		// creating new user to db
		const user = await userModel.create({
			username,
			email,
			password: hashedPassword,
			role,
		})

		// generating token
		const token = jwt.sign(
			{
				id: user._id,
				role: user.role,
			},
			process.env.JWT_SECRET,
		)
		// setting token to user's browser cookie
		res.cookie('token', token)

		// response back on success
		return res.status(201).json({
			message: 'User created successfully',
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				role: user.role,
			},
		})
	} catch (error) {
		console.log(error)
		// response back on error
		return res.status(500).json({ message: 'Server error' })
	}
}

// controller for signin post route
async function signinPostController(req, res) {
	// extracting all data sent by client
	const { username, email, password } = req.body

	try {
		// finding user to db by username & email both
		const user = await userModel.findOne({
			$or: [{ username }, { email }],
		})

		// throwing error if user not found by username/email both
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' })
		}

		// checking is provided password valid/invalid
		const isPasswordValid = await bcrypt.compare(password, user.password)

		// throwing error if password got invalid
		if (!isPasswordValid) {
			return res.status(401).json({ message: 'Invalid credentials' })
		}

		// generating token
		const token = jwt.sign(
			{
				id: user._id,
				role: user.role,
			},
			process.env.JWT_SECRET,
		)
		// setting token to user's browser cookie
		res.cookie('token', token)

		// response back on success
		return res.status(200).json({
			message: 'User signed in successfully',
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				role: user.role,
			},
		})
	} catch (error) {
		console.log(error)
		// response back on error
		return res.status(500).json({ message: 'Server error' })
	}
}

// exporting controllers
module.exports = {
	signupPostController,
	signinPostController,
}