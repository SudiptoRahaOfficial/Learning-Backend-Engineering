// importing dependencis
const { connect } = require('mongoose')
const config = require('../config/config')

// function for db connection
async function connectDB() {
	try {
		await connect(config.DB_CONNECTION_URI)
		console.log('Database connected successfully!')
	} catch (error) {
		console.log('Failed to connect database!')
	}
}

// exporting db-connection function
module.exports = connectDB