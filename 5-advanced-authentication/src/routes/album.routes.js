// importing dependencis
const router = require('express').Router()
const {
    authenticateUser,
    authorizeArtist
} = require('../middlewares/auth.middlewares')
const {
    createPostController
} = require('../controllers/album.controllers')

// album create post route
router.post('/create', authenticateUser, authorizeArtist, createPostController)

// exporting router
module.exports = router