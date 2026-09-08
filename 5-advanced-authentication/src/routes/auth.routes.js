// importing dependencis
const router = require('express').Router()
const {
	signupPostController,
	signinPostController,
	signoutPostController,
} = require('../controllers/auth.controllers')

// signup post api
router.post('/signup', signupPostController)

// signin post api
router.post('/signin', signinPostController)

// signout post api
router.post('/signout', signoutPostController)

// exporting router
module.exports = router