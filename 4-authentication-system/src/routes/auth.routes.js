// extracting router form express
const router = require('express').Router()
const { registerPostController } = require('../controllers/auth.controller')

// register route
router.post('/register', registerPostController)

// exporting router
module.exports = router