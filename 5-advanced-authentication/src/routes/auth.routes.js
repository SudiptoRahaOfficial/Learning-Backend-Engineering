// importing dependencis
const router = require('express').Router()
const {
	signupPostController,
	signinPostController,
} = require('../controllers/auth.controllers')

// signup post api
router.post('/signup', signupPostController)
router.post('/signin', signinPostController)

// exporting router
module.exports = router