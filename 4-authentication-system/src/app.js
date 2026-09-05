// importing dependencis
const express = require('express')
const authRoutes = require('./routes/auth.routes')

// making app
const app = express()

// middlewares array
const middlewares = [
	express.urlencoded({ extended: true }), // accept form-data
	express.json(), // accept json-data
]
app.use(middlewares) // using middlewares

// connecting auth routes
app.use('/api/auth', authRoutes)

// exporting app
module.exports = app