// importing dependencis
const router = require('express').Router()
const { authenticateUser } = require('../middlewares/auth.middlewares')
const {
	createPostController,
	getAllAlbumsController,
	getAlbumById,
} = require('../controllers/album.controllers')

// album create post route
router.post('/create', authenticateUser, createPostController)

// get all albums route
router.get('/', authenticateUser, getAllAlbumsController)

// get perticular album route
router.get('/:id', authenticateUser, getAlbumById)

// exporting router
module.exports = router