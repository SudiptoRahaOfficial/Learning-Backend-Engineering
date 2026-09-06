// importing dependencis
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')

// controller function for - register post route
async function registerPostController(req, res, next) {
	// extracting client data
	const { username, email, password } = req.body

	try {
		// returning error if user already exists with provided email
		const isUserAlreadyExists = await userModel.findOne({ email })
		if (isUserAlreadyExists) {
			return res.status(409).json({
				message: 'user already exists',
			})
		}

		// creating user to db
		const user = await userModel.create({
			username,
			email,
			password,
		})

		// creating token by jwt
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

		// sending token to user's browser cookie
		res.cookie('token', token)

		// response back on success
		return res.status(201).json({
			message: 'user created successfully',
			user,
		})
	} catch (error) {
		console.log(error)

		// response back on failure
		return res.status(500).json({
			message: 'server error',
			error,
		})
	}
}

// exporting controllers
module.exports = {
	registerPostController,
}