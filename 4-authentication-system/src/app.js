// importing dependencis
const express = require('express')

// making app
const app = express()

// middlewares array
const middlewares = [
	express.urlencoded({ extended: true }), // accept form-data
	express.json(), // accept json-data
]
app.use(middlewares) // using middlewares

// exporting app
module.exports = app