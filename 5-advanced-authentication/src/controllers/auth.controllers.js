/*
 * file name: auth.controllers.js
 * responsibility: responsible for all auth related api controllers
 */

// importing dependencis
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config/env.config')
const userModel = require('../models/user.model')
const sessionModel = require('../models/session.model')
const otpModel = require('../models/otp.model')
const sendEmail = require('../services/email.service')
const {
	generateSecureOTP,
	generateEmailBodyHtml,
} = require('../utils/auth.utils')

// controller for signup post route
async function signupPostController(req, res) {
	// extracting all data sent by client
	const { username, email, password } = req.body

	// validating required fields
	if (!username || !email || !password) {
		return res.status(400).json({
			message: 'Username, email and password are required',
		})
	}

	// normalizing username
	const normalizedUsername = username.trim()

	// normalizing email
	const normalizedEmail = email.trim().toLowerCase()

	// validating email format
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
		return res.status(400).json({
			message: 'Invalid email address',
		})
	}

	// validating password's length
	if (password.length < 6) {
		return res.status(400).json({
			message: 'Password must be at least 6 characters',
		})
	}

	try {
		// returning response with error on duplicate username/email
		const isUserAlreadyExists = await userModel.findOne({
			$or: [{ username: normalizedUsername }, { email: normalizedEmail }],
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
			username: normalizedUsername,
			email: normalizedEmail,
			password: hashedPassword,
		})

		// generating otp & otp email body html
		const otp = generateSecureOTP()
		const emailBodyHtml = generateEmailBodyHtml(otp)

		// encrypting otp
		const hashedOtp = await bcrypt.hash(otp, 10)

		// creating new otp document to db
		const otpDoc = await otpModel.create({
			email: normalizedEmail,
			user: user._id,
			otpHash: hashedOtp,
			expiresAt: new Date(Date.now() + 1 * 60 * 1000),
		})

		try {
			// sending new OTP to user's email
			await sendEmail(
				normalizedEmail,
				'OTP verification',
				`Your OTP code is ${otp}`,
				emailBodyHtml,
			)
		} catch (emailError) {
			// if email sending failed remove the newly created OTP
			await otpModel.deleteOne({
				_id: otpDoc._id,
			})

			// throwing email error
			throw emailError
		}

		// response back on success
		return res.status(201).json({
			message: 'Signup successful! Please verify your email.',
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				role: user.role,
				verified: user.verified,
			},
		})
	} catch (error) {
		if (error.code === 11000) {
			return res.status(409).json({
				message: 'Username or email already exists',
			})
		}

		// logging on unexpected server error
		console.error(error)

		// response back on error
		return res.status(500).json({
			message: 'Internal server error',
		})
	}
}

// controller for signin post route
async function signinPostController(req, res) {
	// extracting all data sent by client
	const { username, email, password } = req.body

	// normalizing username & email
	const normalizedUsername = username?.trim()
	const normalizedEmail = email?.trim().toLowerCase()

	// validating required fields
	if ((!normalizedUsername && !normalizedEmail) || !password) {
		return res.status(400).json({
			message: 'Username or email and password are required',
		})
	}

	// validating that only one identifier is provided
	if (normalizedUsername && normalizedEmail) {
		return res.status(400).json({
			message: 'Provide either username or email, not both',
		})
	}

	// validating email format
	if (
		normalizedEmail &&
		!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
	) {
		return res.status(400).json({
			message: 'Invalid email address',
		})
	}

	// making query accroding username/email
	const query = normalizedUsername
		? { username: normalizedUsername }
		: { email: normalizedEmail }

	try {
		// finding user to db by username or email
		const user = await userModel.findOne(query)

		// returning response with error if user not found by username/email both
		if (!user) {
			return res.status(401).json({
				message: 'Invalid credentials',
			})
		}

		// returning response with error if email not verified
		if (!user.verified) {
			return res.status(401).json({
				message: 'Email not verified',
			})
		}

		// checking is provided password valid/invalid
		const isPasswordValid = await bcrypt.compare(password, user.password)

		// returning response with error if password got invalid
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
				type: 'refresh',
				id: user._id,
				sessionId: session._id,
			},
			config.REFRESH_TOKEN_SECRET,
			{ expiresIn: '7d' },
		)

		// hashing & storing refresh token to db
		const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)
		session.refreshTokenHash = hashedRefreshToken
		await session.save()

		// setting refreshToken to browser's cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
		})

		// generating access token
		const accessToken = jwt.sign(
			{
				type: 'access',
				id: user._id,
				sessionId: session._id,
			},
			config.ACCESS_TOKEN_SECRET,
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
		// logging on unexpected server error
		console.error(error)

		// response back on error
		return res.status(500).json({
			message: 'Internal server error',
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
		const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET)

		// extracting user id, user role and session id
		const { type, id, sessionId } = decoded

		// returning response with error if required data missing
		if (type !== 'refresh' || !id || !sessionId) {
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

		// logging on unexpected server error
		console.error(error)

		// returning response for unexpected server errors
		return res.status(500).json({
			message: 'Internal server error',
		})
	}
}

// controller for signout all post route
async function signoutAllPostController(req, res) {
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
		const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET)

		// extracting user id and session id
		const { type, id, sessionId } = decoded

		// returning response with error if required token data missing
		if (type !== 'refresh' || !id || !sessionId) {
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

		// revoking all active sessions belonging to the authenticated user
		await sessionModel.updateMany(
			{ user: id, revoked: false },
			{ revoked: true },
		)

		// clearing refreshToken from browser's cookies
		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
		})

		// response back on success
		return res.status(200).json({
			message: 'Signed out from all devices successfully',
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

		// logging on unexpected server error
		console.error(error)

		// returning response for unexpected server errors
		return res.status(500).json({
			message: 'Internal server error',
		})
	}
}

// controller for verify-email post route
async function verifyEmailPostController(req, res) {
	// extracting all data sent by client
	const { otp, email } = req.body

	// validating required fields
	if (!otp || !email) {
		return res.status(400).json({
			message: 'Email and OTP are required',
		})
	}

	// normalizing email
	const normalizedEmail = email.trim().toLowerCase()

	// validating email format
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
		return res.status(400).json({
			message: 'Invalid email address',
		})
	}

	// validating OTP format
	if (!/^\d{6}$/.test(otp)) {
		return res.status(400).json({
			message: 'Invalid OTP format',
		})
	}

	try {
		// finding otp document to db
		const otpDoc = await otpModel.findOne({
			email: normalizedEmail,
			expiresAt: { $gt: new Date() },
		})

		// returning response with error if otp document not found at db
		if (!otpDoc) {
			return res.status(400).json({
				message: 'Invalid or expired OTP',
			})
		}

		// securely comparing provided OTP with stored OTP
		const isOtpValid = await bcrypt.compare(otp, otpDoc.otpHash)

		// returning response with error if OTP is incorrect
		if (!isOtpValid) {
			return res.status(400).json({
				message: 'Invalid or expired OTP',
			})
		}

		// updating verified status true at user document if OTP verified
		const user = await userModel.findOneAndUpdate(
			{ _id: otpDoc.user },
			{ $set: { verified: true } },
			{ new: true },
		)

		// returning response with error if user does not exist
		if (!user) {
			return res.status(404).json({
				message: 'User not found',
			})
		}

		// deleting all OTPs belonging to the user
		await otpModel.deleteMany({ user: otpDoc.user })

		// returning response on success
		return res.status(200).json({
			message: 'Email verified successfully',
			user: {
				username: user.username,
				email: user.email,
				verified: user.verified,
			},
		})
	} catch (error) {
		// logging on unexpected server error
		console.error(error)

		// returning response for unexpected server errors
		return res.status(500).json({
			message: 'Internal server error',
		})
	}
}

// controller for resend-verify-email post route
async function resendVerifyEmailPostController(req, res) {
	// extracting email sent by client
	const { email } = req.body

	// validating required field
	if (!email) {
		return res.status(400).json({
			message: 'Email is required',
		})
	}

	// normalizing email
	const normalizedEmail = email.trim().toLowerCase()

	// validating email format
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
		return res.status(400).json({
			message: 'Invalid email address',
		})
	}

	try {
		// finding user by normalized email
		const user = await userModel.findOne({
			email: normalizedEmail,
		})

		// returning response with error if user not exists
		if (!user) {
			return res.status(200).json({
				message: 'User not found',
			})
		}

		// returning response if email already verified
		if (user.verified) {
			return res.status(200).json({
				message: 'Email already verified',
			})
		}

		// invalidating all previously generated OTPs for this user
		await otpModel.deleteMany({
			user: user._id,
		})

		// generating a new secure OTP
		const otp = generateSecureOTP()

		// generating OTP email body
		const emailBodyHtml = generateEmailBodyHtml(otp)

		// hashing OTP before storing it in database
		const hashedOtp = await bcrypt.hash(otp, 10)

		// creating new OTP document
		const otpDoc = await otpModel.create({
			email: normalizedEmail,
			user: user._id,
			otpHash: hashedOtp,
			expiresAt: new Date(Date.now() + 1 * 60 * 1000),
		})

		try {
			// sending new OTP to user's email
			await sendEmail(
				normalizedEmail,
				'OTP verification',
				`Your OTP code is ${otp}`,
				emailBodyHtml,
			)
		} catch (emailError) {
			// if email sending failed remove the newly created OTP
			await otpModel.deleteOne({
				_id: otpDoc._id,
			})

			// throwing email error
			throw emailError
		}

		// response back on success
		return res.status(200).json({
			message: 'A new OTP has been sent',
		})
	} catch (error) {
		// logging on unexpected server error
		console.error(error)

		// response back for unexpected server errors
		return res.status(500).json({
			message: 'Internal server error',
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
		const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET)

		// extracting user id, user role and session id from verified token
		const { type, id, sessionId } = decoded

		// returning response with error if required token data missing
		if (type !== 'refresh' || !id || !sessionId) {
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
				type: 'refresh',
				id: user._id,
				sessionId: session._id,
			},
			config.REFRESH_TOKEN_SECRET,
			{ expiresIn: '7d' },
		)

		// hashing & storing refresh token to db
		const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10)
		session.refreshTokenHash = hashedNewRefreshToken
		await session.save()

		// setting new refreshToken to browser's cookie
		res.cookie('refreshToken', newRefreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
		})

		// generating new access token
		const accessToken = jwt.sign(
			{
				type: 'access',
				id: user._id,
				sessionId: session._id,
			},
			config.ACCESS_TOKEN_SECRET,
			{ expiresIn: '15m' },
		)

		// response back with newly generated access token
		return res.status(200).json({
			message: 'Access token refreshed successfully',
			accessToken,
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

		// logging on unexpected server error
		console.error(error)

		// returning response for unexpected server errors
		return res.status(500).json({
			message: 'Internal server error',
		})
	}
}

// exporting controllers
module.exports = {
	signupPostController,
	signinPostController,
	signoutPostController,
	signoutAllPostController,
	verifyEmailPostController,
	resendVerifyEmailPostController,
	refreshTokenPostController,
}