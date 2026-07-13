const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  login,
  register,
  getProfile,
  changePassword,
} = require('../controllers/authController');

router.post('/login', login);       
router.post('/register', register); 

router.get('/profile', auth, getProfile);            
router.put('/change-password', auth, changePassword); 

module.exports = router;
