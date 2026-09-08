// importing dependencis
const router = require('express').Router()
const upload = require('../utils/uploadWithMulter')
const {
	authenticateUser,
	authorizeArtist,
} = require('../middlewares/auth.middlewares')
const {
	uploadPostController,
	getAllMusicsController,
} = require('../controllers/music.controllers')

// music upload post route
router.post(
	'/upload',
	authenticateUser,
	authorizeArtist,
	upload.single('music'),
	uploadPostController,
)

// get all musics route
router.get('/', authenticateUser, getAllMusicsController)

// exporting router
module.exports = router