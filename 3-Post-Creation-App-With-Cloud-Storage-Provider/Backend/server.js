// importing & configuring dotenv
require('dotenv').config()

// importing dependencis
const app = require('./src/app')
const connectDb = require('./src/db/connectDb')

const port = process.env.PORT || 3000 // defining port

// connecting server with database
connectDb()

// starting server or listening for server
app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})