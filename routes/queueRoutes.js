const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getQueues,
  createQueue,
  updateQueueStatus,
  deleteQueue,
  getDoctorQueue,
  getDashboardStats,
} = require('../controllers/queueController');

router.get('/stats/dashboard', auth, getDashboardStats); 
router.get('/doctor/me', auth, getDoctorQueue);          

router.get('/', auth, getQueues);                
router.post('/', auth, createQueue);              
router.put('/:id', auth, updateQueueStatus);      
router.delete('/:id', auth, deleteQueue);         

module.exports = router;
