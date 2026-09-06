// importing dependencis
const { connect } = require('mongoose')

// db connection uri
const dbConnectionUri = process.env.DB_CONNECTION_URI

// function for db connection
async function connectDB() {
	try {
		await connect(dbConnectionUri)
		console.log('Database connected successfully!')
	} catch (error) {
		console.log('Failed to connect database!')
	}
}

// exporting db-connection function
module.exports = connectDB