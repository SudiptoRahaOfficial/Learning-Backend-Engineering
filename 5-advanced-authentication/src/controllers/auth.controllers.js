// importing dependencis
const userModel = require('../models/user.model')

// controller for signup post route
async function signupPostController(req, res) {
	// extracting all data sent by client
	const { username, email, password, role } = req.body
}

// exporting controllers
module.exports = {
	signupPostController,
}