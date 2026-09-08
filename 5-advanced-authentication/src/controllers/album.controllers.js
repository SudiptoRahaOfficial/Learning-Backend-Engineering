// importing dependencis
const albumModel = require('../models/album.model')

// controller for album create post route
async function createPostController(req, res, next) {
	// extracting all data sent by client
	const { title, musics } = req.body

	try {
		// creating album to db
		const album = await albumModel.create({
			title,
			musics,
			artist: req.user.id,
		})

		// response back on success
		return res.status(201).json({
			message: 'Album created successfully',
			album: {
				id: album._id,
				title: album.title,
				artist: album.artist,
				musics: album.musics,
			},
		})
	} catch (error) {
		// returning conflict response for duplicate album title
		if (error.code === 11000 && error.keyPattern?.title) {
			return res.status(409).json({
				message: 'Album with this title already exists',
			})
		}

		// response back on failure
		res.status(500).json({
			message: 'Server error',
		})
	}
}

// controller for get all albums route
async function getAllAlbumsController(req, res) {
	try {
		// fetching all albums form db
		const albums = await albumModel
			.find()
			.select('title artist')
			.populate('artist', 'username email')

		// response back on success
		return res.status(200).json({
			message: 'Albums fetched successfully',
			albums,
		})
	} catch (error) {
		// response back on failure
		res.status(500).json({
			message: 'Server error',
		})
	}
}

// controller for get perticular album route
async function getAlbumById(req, res) {
	// extracting id from req.params
	const id = req.params.id

	try {
		// finding requested album to db
		const album = await albumModel
			.findById(id)
			.populate('artist', 'username email')
			.populate('musics')

		// response back on success
		return res.status(200).json({
			message: 'Album fetched successfully',
			album,
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
	createPostController,
	getAllAlbumsController,
	getAlbumById,
}