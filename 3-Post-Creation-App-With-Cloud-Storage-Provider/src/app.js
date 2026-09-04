// importing dependencis
const express = require('express')
const multer = require('multer')
const uploadFile = require('./services/storage.service')
const postModel = require('./models/post.model')

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
	// uploading file-buffer to imagekit
	const result = await uploadFile(req.file.buffer)

	// creating post
	const post = await postModel.create({
		image: result.url,
		caption: req.body.caption,
	})

	// response back
	return res.status(201).json({
		message: 'post created successfully',
		post,
	})
})

// exporting app
module.exports = app