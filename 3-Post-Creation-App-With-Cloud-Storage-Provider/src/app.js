// importing dependencis
const express = require('express')
const multer = require('multer')

// making app
const app = express()

// middlewares array
const middlewares = [
	express.urlencoded({ extended: true }), // accept form-data
	express.json(), // accept json-data
]
app.use(middlewares) // using middlewares

// image uploading middleware
const upload = multer({ storage: multer.memoryStorage() })

// create post
app.post('/create-post', upload.single('image'), async (req, res) => {
	
})

// exporting app
module.exports = app