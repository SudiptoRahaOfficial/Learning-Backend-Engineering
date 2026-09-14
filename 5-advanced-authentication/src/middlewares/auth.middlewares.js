/*
 * file name: auth.middlewares.js
 * responsibility: responsible for all auth related middlewares
 */

// importing dependencis
const jwt = require('jsonwebtoken')
const config = require('../config/env.config')
const sessionModel = require('../models/session.model')
const userModel = require('../models/user.model')

// middleware for authenticate user
async function authenticateUser(req, res, next) {
	// extracting authorization header from request
	const authorization = req.headers.authorization

	// returning response with error if authorization header not found
	if (!authorization) {
		return res.status(401).json({
			message: 'Authentication required',
		})
	}

	// extracting authorization scheme and access token
	const [scheme, accessToken] = authorization.trim().split(/\s+/)

	// validating Bearer authentication scheme and access token
	if (scheme !== 'Bearer' || !accessToken) {
		return res.status(401).json({
			message: 'Invalid authorization header',
		})
	}

	try {
		// verifying accessToken and extracting authenticated user data
		const decoded = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET)

		// extracting user id and session id
		const { type, id, sessionId } = decoded

		// returning response with error if required data missing
		if (type !== 'access' || !id || !sessionId) {
			return res.status(401).json({
				message: 'Invalid access token',
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
				message: 'Invalid access token',
			})
		}

		// finding user by access token's id
		const user = await userModel.findById(id)

		// returning response with error if user not exist
		if (!user) {
			return res.status(401).json({
				message: 'Unauthenticated user',
			})
		}

		// attaching authenticated user data to request
		req.user = {
			id: user._id,
			role: user.role,
			sessionId: session._id,
		}

		// passing request on success path
		next()
	} catch (error) {
		// returning 401 if the access token is invalid or expired
		if (
			error.name === 'JsonWebTokenError' ||
			error.name === 'TokenExpiredError'
		) {
			return res.status(401).json({
				message: 'Invalid access token',
			})
		}

		// logging on unexpected server error
		console.error(error)

		// response back on error
		return res.status(500).json({
			message: 'Internal Server error',
		})
	}
}

// middleware for authorize artist
function authorizeArtist(req, res, next) {
	// validating user object exists with request
	if (!req.user) {
		return res.status(401).json({
			message: 'Unauthenticated user',
		})
	}

	// returning response with error if role is not artist
	if (req.user.role !== 'artist') {
		return res
			.status(403)
			.json({ message: 'Forbidden! Artist account required to access' })
	}

	// passing request on success path
	next()
}

// exporting middlewares
module.exports = {
	authenticateUser,
	authorizeArtist,
}