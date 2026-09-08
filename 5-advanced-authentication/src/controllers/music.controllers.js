// importing dependencis
const musicModel = require('../models/music.model')
const uploadFile = require('../services/storage.service')

// controller for music upload post route
async function uploadPostController(req, res) {
	// extracting all data from client
	const { title } = req.body
	const file = req.file

	// validating required fields
	if (!title || !file) {
		return res.status(400).json({
			message: 'Title and music file are required',
		})
	}

	try {
		// uploading music file to cloud storage
		const result = await uploadFile(file.buffer.toString('base64'))

		// creating music to db
		const music = await musicModel.create({
			uri: result.url,
			title,
			artist: req.user.id,
		})

		// response back on success
		return res.status(201).json({
			message: 'Music created successfully',
			music: {
				id: music._id,
				uri: music.uri,
				title: music.title,
				artist: music.artist,
			},
		})
	} catch (error) {
		// response back on failure
		res.status(500).json({
			message: 'Server error',
		})
	}
}

// controller for get all musics route
async function getAllMusicsController(req, res) {
	try {
		// fetching all musics form db
		const musics = await musicModel
			.find()
			.skip(1)
			.limit(1)
			.populate('artist', 'username email')

		// response back on success
		return res.status(200).json({
			message: 'Musics fetched successfully',
			musics,
		})
	} catch (error) {
		// response back on failure
		res.status(500).json({
			message: 'Server error',
		})
	}
}

// exporting controllers
module.exports = {
	uploadPostController,
	getAllMusicsController,
}