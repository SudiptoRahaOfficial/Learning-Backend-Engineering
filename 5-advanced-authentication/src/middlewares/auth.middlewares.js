// importing dependencis
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const sessionModel = require('../models/session.model')

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
		const decoded = jwt.verify(accessToken, config.JWT_SECRET)

		// extracting user id and session id
		const { id, role, sessionId } = decoded

		// returning response with error if required data missing
		if (!id || !role || !sessionId) {
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

		// attaching authenticated user data to request
		req.user = { id, role, sessionId }

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