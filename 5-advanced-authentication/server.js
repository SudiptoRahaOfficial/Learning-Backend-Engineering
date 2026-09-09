// importing dependencis
const app = require('./src/app')
const config = require('./src/config/config')
const connectDB = require('./src/db/connectDB')

const port = config.PORT // defining port

// connecting server with database
connectDB()

// starting server or listening for server
app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})