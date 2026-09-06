// importing dependencis
const router = require('express').Router()
const {
    signupPostController
} = require('../controllers/auth.controllers')

// signup post api
router.post('/signup', signupPostController)

// exporting router
module.exports = router