const router = require('express').Router()
const { signup, login } = require('../controllers/AuthController');

// Signup Route
router.post('/signup', signup )

  // Login Route
 router.post('/login', login)


  module.exports = router;
