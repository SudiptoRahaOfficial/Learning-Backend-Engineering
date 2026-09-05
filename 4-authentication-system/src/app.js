// importing dependencis
const express = require('express')
const routes = require('./routes/auth.routes')

// making app
const app = express()

// middlewares array
const middlewares = [
	express.urlencoded({ extended: true }), // accept form-data
	express.json(), // accept json-data
]
app.use(middlewares) // using middlewares

app.use(routes)

// exporting app
module.exports = app