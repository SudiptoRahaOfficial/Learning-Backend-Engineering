// importing dependencis
const router = require('express').Router()
const {
	signupPostController,
	signinPostController,
	signoutPostController,
	signoutAllPostController,
	refreshTokenPostController,
} = require('../controllers/auth.controllers')

// signup post api
router.post('/signup', signupPostController)

// signin post api
router.post('/signin', signinPostController)

// signout post api
router.post('/signout', signoutPostController)

// signout all post api
router.post('/signout-all', signoutAllPostController)

// refresh-token get api
router.post('/refresh-token', refreshTokenPostController)

// exporting router
module.exports = router