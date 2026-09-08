// importing dependencis
const router = require('express').Router()
const {
	authenticateUser,
	authorizeArtist,
} = require('../middlewares/auth.middlewares')
const {
	createPostController,
	getAllAlbumsController,
} = require('../controllers/album.controllers')

// album create post route
router.post('/create', authenticateUser, authorizeArtist, createPostController)

// get all albums route
router.get('/', authenticateUser, getAllAlbumsController)

// exporting router
module.exports = router