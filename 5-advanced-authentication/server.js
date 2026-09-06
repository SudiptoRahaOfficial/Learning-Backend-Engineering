// importing & configuring dotenv
require('dotenv').config()

// importing dependencis
const app = require('./src/app')
const connectDB = require('./src/db/connectDB')

const port = process.env.PORT || 3000 // defining port

// connecting server with database
connectDB()

// starting server or listening for server
app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})