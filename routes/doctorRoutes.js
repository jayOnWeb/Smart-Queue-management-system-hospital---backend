const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');

router.get('/', auth, getDoctors);         
router.post('/', auth, createDoctor);       
router.get('/:id', auth, getDoctorById);    
router.put('/:id', auth, updateDoctor);     
router.delete('/:id', auth, deleteDoctor);  

module.exports = router;
