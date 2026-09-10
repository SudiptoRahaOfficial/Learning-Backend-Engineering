// importing dependencis
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const userModel = require('../models/user.model')
const sessionModel = require('../models/session.model')

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

		// encrypting password
		const hashedPassword = await bcrypt.hash(password, 10)

		// creating new user to db
		const user = await userModel.create({
			username,
			email,
			password: hashedPassword,
			role,
		})

		// generating refresh token
		const refreshToken = jwt.sign(
			{
				id: user._id,
				role: user.role,
			},
			config.JWT_SECRET,
			{ expiresIn: '7d' },
		)

		// setting refreshToken to browser's cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
		})

		// encrypting refresh token
		const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

		// creating session to db
		const session = await sessionModel.create({
			user: user._id,
			refreshTokenHash: hashedRefreshToken,
			ip: req.ip,
			userAgent: req.headers['user-agent'],
		})

		// generating access token
		const accessToken = jwt.sign(
			{
				id: user._id,
				role: user.role,
				sessionId: session._id,
			},
			config.JWT_SECRET,
			{ expiresIn: '15m' },
		)

		// response back on success
		return res.status(201).json({
			message: 'User created successfully',
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				role: user.role,
			},
			accessToken,
		})
	} catch (error) {
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

		// generating access token
		const accessToken = jwt.sign(
			{
				id: user._id,
				role: user.role,
			},
			config.JWT_SECRET,
			{ expiresIn: '15m' },
		)

		// generating refresh token
		const refreshToken = jwt.sign(
			{
				id: user._id,
				role: user.role,
			},
			config.JWT_SECRET,
			{ expiresIn: '7d' },
		)

		// setting refreshToken to browser's cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
		})

		// response back on success
		return res.status(200).json({
			message: 'User signed in successfully',
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				role: user.role,
			},
			accessToken,
		})
	} catch (error) {
		// response back on error
		return res.status(500).json({ message: 'Server error' })
	}
}

// controller for signout post route
function signoutPostController(req, res) {
	res.clearCookie('refreshToken')
	res.status(200).json({ message: 'User signed out successfully' })
}

// controller for refresh-token post route
async function refreshTokenPostController(req, res) {
	// extracting refreshToken form cookies
	const refreshToken = req.cookies.refreshToken

	// returning response with error if token not found
	if (!refreshToken) {
		return res.status(401).json({
			message: 'Unauthenticated user',
		})
	}

	try {
		// verifying token
		const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

		// extracting user id from verified token
		const { id } = decoded

		// returning response with error if user id missing
		if (!id) {
			return res.status(401).json({
				message: 'Invalid refresh token',
			})
		}

		// checking for the user to db
		const user = await userModel.findById(id)

		// returning response with error if user not found
		if (!user) {
			return res.status(401).json({
				message: 'Unauthenticated user',
			})
		}

		// generating a new access token
		const accessToken = jwt.sign(
			{ id: user._id, role: user.role },
			config.JWT_SECRET,
			{ expiresIn: '15m' },
		)

		// generating a new refresh token
		const newRefreshToken = jwt.sign(
			{ id: user._id, role: user.role },
			config.JWT_SECRET,
			{ expiresIn: '7d' },
		)

		// setting refreshToken to browser's cookie
		res.cookie('refreshToken', newRefreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
		})

		// response back with newly generated access token
		return res.status(200).json({
			message: 'Access token refreshed successfully',
			accessToken,
		})
	} catch (error) {
		// returning response with error if token got invalid
		return res.status(401).json({ message: 'Unauthenticated user' })
	}
}

// exporting controllers
module.exports = {
	signupPostController,
	signinPostController,
	signoutPostController,
	refreshTokenPostController,
}