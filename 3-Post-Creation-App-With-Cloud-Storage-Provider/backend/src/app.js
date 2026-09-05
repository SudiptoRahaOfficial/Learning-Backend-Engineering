// importing dependencis
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const uploadFile = require('./services/storage.service')
const postModel = require('./models/post.model')

// making app
const app = express()

// middlewares array
const middlewares = [
	cors(), // accept cross-origin requests from trusted origins
	express.urlencoded({ extended: true }), // accept form-data
	express.json(), // accept json-data
]
app.use(middlewares) // using middlewares

// image uploading middleware
const upload = multer({ storage: multer.memoryStorage() })

// create post api
app.post('/create-post', upload.single('image'), async (req, res) => {
	try {
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
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: 'server error' })
	}
})

// fetch all posts api
app.get('/posts', async (req, res) => {
	try {
		// fetching all db stored posts
		const posts = await postModel.find()

		// response back
		return res.status(200).json({
			message: 'posts fetched successfully',
			posts,
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: 'server error' })
	}
})

// exporting app
module.exports = app