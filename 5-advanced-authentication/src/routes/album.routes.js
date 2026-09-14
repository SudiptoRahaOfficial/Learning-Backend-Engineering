/*
 * file name: album.routes.js
 * responsibility: responsible for all album related api endpoints
 */

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

// get particular album route
router.get('/:id', authenticateUser, getAlbumById)

// get all albums route
router.get('/', authenticateUser, getAllAlbumsController)

// exporting router
module.exports = router