// importing dependencis
const userModel = require('../models/user.model')

// controller function for register route
async function registerPostController(req, res, next) {
	res.send('Register!')
}

// exporting controllers
module.exports = {
	registerPostController,
}