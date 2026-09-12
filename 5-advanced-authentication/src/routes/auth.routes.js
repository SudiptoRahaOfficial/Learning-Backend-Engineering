// importing dependencis
const router = require('express').Router()
const {
	signupPostController,
	signinPostController,
	signoutPostController,
	signoutAllPostController,
	verifyEmailPostController,
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

// verify-email post api
router.post('/verify-email', verifyEmailPostController)

// refresh-token get api
router.post('/refresh-token', refreshTokenPostController)

// exporting router
module.exports = router