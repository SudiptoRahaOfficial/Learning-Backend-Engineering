require('dotenv').config()              // importing & configuring dotenv
const app = require('./src/app')        // importing app
const port = process.env.PORT || 3000   // defining port

// starting server or listening for server
app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})