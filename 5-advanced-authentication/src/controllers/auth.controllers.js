// importing dependencis
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const userModel = require('../models/user.model')
const sessionModel = require('../models/session.model')

// controller for signup post route
async function signupPostController(req, res) {
	// extracting all data sent by client
	const { username, email, password, role } = req.body

	try {
		// throwing error on duplicate username/email
		const isUserAlreadyExists = await userModel.findOne({
			$or: [{ username }, { email }],
		})

		if (isUserAlreadyExists) {
			return res.status(409).json({
				message: 'User already exists',
			})
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

		// creating an empty session to generate a unique session id
		const session = await sessionModel.create({
			user: user._id,
			ip: req.ip,
			userAgent: req.headers['user-agent'],
		})

		// generating refresh token
		const refreshToken = jwt.sign(
			{
				id: user._id,
				role: user.role,
				sessionId: session._id,
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

		// hashing refresh token for secure session storage
		const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

		// storing refresh token hash in session & saving to db
		session.refreshTokenHash = hashedRefreshToken
		await session.save()

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
		return res.status(500).json({
			message: 'Server error',
		})
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
			return res.status(401).json({
				message: 'Invalid credentials',
			})
		}

		// checking is provided password valid/invalid
		const isPasswordValid = await bcrypt.compare(password, user.password)

		// throwing error if password got invalid
		if (!isPasswordValid) {
			return res.status(401).json({
				message: 'Invalid credentials',
			})
		}

		// creating an empty session to generate a unique session id
		const session = await sessionModel.create({
			user: user._id,
			ip: req.ip,
			userAgent: req.headers['user-agent'],
		})

		// generating refresh token
		const refreshToken = jwt.sign(
			{
				id: user._id,
				role: user.role,
				sessionId: session._id,
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

		// hashing refresh token for secure session storage
		const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

		// storing refresh token hash in session & saving to db
		session.refreshTokenHash = hashedRefreshToken
		await session.save()

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
		return res.status(500).json({
			message: 'Server error',
		})
	}
}

// controller for signout post route
async function signoutPostController(req, res) {
	// extracting refresh token
	const refreshToken = req.cookies.refreshToken

	// returning response with error if refresh token not found
	if (!refreshToken) {
		return res.status(401).json({
			message: 'Unauthenticated user',
		})
	}

	try {
		// verifying refresh token
		const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

		// extracting user id and session id
		const { id, role, sessionId } = decoded

		// returning response with error if required data missing
		if (!id || !role || !sessionId) {
			return res.status(401).json({
				message: 'Invalid refresh token',
			})
		}

		// finding active session belonging to authenticated user
		const session = await sessionModel.findOne({
			_id: sessionId,
			user: id,
			revoked: false,
		})

		// returning response with error if session not found
		if (!session) {
			return res.status(401).json({
				message: 'Invalid refresh token',
			})
		}

		// checking refresh token against stored session hash
		const isRefreshTokenValid = await bcrypt.compare(
			refreshToken,
			session.refreshTokenHash,
		)

		// returning response with error if refresh token is invalid
		if (!isRefreshTokenValid) {
			return res.status(401).json({
				message: 'Invalid refresh token',
			})
		}

		// revoking session & saving to db
		session.revoked = true
		await session.save()

		// clearing refreshToken from browser's cookies
		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
		})

		// response back on success
		return res.status(200).json({
			message: 'User signed out successfully',
		})
	} catch (error) {
		// returning response if refresh token verification fails
		if (
			error.name === 'JsonWebTokenError' ||
			error.name === 'TokenExpiredError'
		) {
			res.clearCookie('refreshToken', {
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
			})

			return res.status(401).json({
				message: 'Invalid refresh token',
			})
		}

		// returning response for unexpected server errors
		return res.status(500).json({
			message: 'Server error',
		})
	}
}

// controller for refresh-token post route
async function refreshTokenPostController(req, res) {
	// extracting refreshToken from cookies
	const refreshToken = req.cookies.refreshToken

	// returning response with error if token not found
	if (!refreshToken) {
		return res.status(401).json({
			message: 'Unauthenticated user',
		})
	}

	try {
		// verifying refresh token
		const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

		// extracting user id and session id from verified token
		const { id, role, sessionId } = decoded

		// returning response with error if required token data missing
		if (!id || !role || !sessionId) {
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

		// finding active session belonging to authenticated user
		const session = await sessionModel.findOne({
			_id: sessionId,
			user: id,
			revoked: false,
		})

		// returning response with error if session not found
		if (!session) {
			return res.status(401).json({
				message: 'Invalid refresh token',
			})
		}

		// checking refresh token against stored session hash
		const isRefreshTokenValid = await bcrypt.compare(
			refreshToken,
			session.refreshTokenHash,
		)

		// returning response with error if refresh token is invalid
		if (!isRefreshTokenValid) {
			return res.status(401).json({
				message: 'Invalid refresh token',
			})
		}

		// generating a new refresh token
		const newRefreshToken = jwt.sign(
			{
				id: user._id,
				role: user.role,
				sessionId: session._id,
			},
			config.JWT_SECRET,
			{ expiresIn: '7d' },
		)

		// setting new refreshToken to browser's cookie
		res.cookie('refreshToken', newRefreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
		})

		// hashing refresh token for secure session storage
		const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10)

		// storing refresh token hash in session & saving to db
		session.refreshTokenHash = hashedNewRefreshToken
		await session.save()

		// generating new access token
		const accessToken = jwt.sign(
			{
				id: user._id,
				role: user.role,
				sessionId: session._id,
			},
			config.JWT_SECRET,
			{ expiresIn: '15m' },
		)

		// response back with newly generated access token
		return res.status(200).json({
			message: 'Access token refreshed successfully',
			accessToken,
		})
	} catch (error) {
		// returning response if refresh token verification fails
		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({
				message: 'Invalid refresh token',
			})
		}

		// returning response if refresh token has expired
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({
				message: 'Refresh token expired',
			})
		}

		// returning response for unexpected server errors
		return res.status(500).json({
			message: 'Server error',
		})
	}
}

// exporting controllers
module.exports = {
	signupPostController,
	signinPostController,
	signoutPostController,
	refreshTokenPostController,
}