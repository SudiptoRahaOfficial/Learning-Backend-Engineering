// importing dependencis
const router = require('express').Router()
const upload = require('../utils/uploadWithMulter')
const {
	authenticateUser,
	authorizeArtist,
} = require('../middlewares/auth.middlewares')
const { uploadPostController } = require('../controllers/music.controllers')

// music upload post route
router.post(
	'/upload',
	authenticateUser,
	authorizeArtist,
	upload.single('music'),
	uploadPostController,
)

// exporting router
module.exports = router