// importing dependencis
const mongoose = require('mongoose')

// db connection uri
const dbConnectionUri = process.env.DB_CONNECTION_URI

// function for db connection
async function connectDb() {
	try {
		await mongoose.connect(dbConnectionUri)
		console.log('Database connected successfully!')
	} catch (error) {
		console.log('Failed to connect database!')
	}
}

// exporting db-connection function
module.exports = connectDb