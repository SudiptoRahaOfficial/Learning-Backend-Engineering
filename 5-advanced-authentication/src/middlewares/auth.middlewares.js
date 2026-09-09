// importing dependencis
const jwt = require('jsonwebtoken')
const config = require('../config/config')

// middleware for authenticate user
function authenticateUser(req, res, next) {
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

		// attaching authenticated user data to request
		req.user = {
			id: decoded.id,
			role: decoded.role,
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