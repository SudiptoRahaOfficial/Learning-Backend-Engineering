// importing dependencis
const express = require('express')
const authRoutes = require('./routes/auth.routes')
var cookieParser = require('cookie-parser')

// making app
const app = express()

// middlewares array
const middlewares = [
	express.urlencoded({ extended: true }), // accept form-data
	express.json(), // accept json-data
	cookieParser(), // parse cookies from incoming requests
]
app.use(middlewares) // using middlewares

// connecting auth routes
app.use('/api/auth', authRoutes)

// exporting app
module.exports = app