// importing dependencis
const jwt = require('jsonwebtoken')
const config = require('../config/config')

// middleware for authenticate user
function authenticateUser(req, res, next) {
	// extracting token from request
	const token = req.cookies.token

	// returning response with error if token not found
	if (!token) {
		return res.status(401).json({ message: 'Unauthenticated user' })
	}

	try {
		// verifying token and extracting authenticated user data
		const decoded = jwt.verify(token, config.JWT_SECRET)

		// attaching authenticated user data to request
		req.user = {
			id: decoded.id,
			role: decoded.role,
		}

		// passing request on success path
		next()
	} catch (error) {
		// returning response with error if token got invalid
		return res.status(401).json({ message: 'Unauthenticated user' })
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