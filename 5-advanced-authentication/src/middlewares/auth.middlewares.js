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
	if (!authorization || !authorization.startsWith('Bearer ')) {
		return res.status(401).json({
			message: 'Unauthenticated user',
		})
	}

	// extracting accessToken from authorization header
	const accessToken = authorization.split(' ')[1]

	try {
		// verifying accessToken and extracting authenticated user data
		const decoded = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET)

		// extracting user id and session id
		const { type, id, role, sessionId } = decoded

		// returning response with error if required data missing
		if (type !== 'access' || !id || !role || !sessionId) {
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
		const user = await userModel.findById(id).select('_id role')

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
		// returning response with error if accessToken got invalid
		return res.status(401).json({
			message: 'Invalid access token',
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

	// extracting role from authenticated user
	const { role } = req.user

	// returning response with error if role is not artist
	if (role !== 'artist') {
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