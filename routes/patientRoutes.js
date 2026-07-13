const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');

router.get('/', auth, getPatients);         
router.post('/', auth, createPatient);       
router.get('/:id', auth, getPatientById);    
router.put('/:id', auth, updatePatient);     
router.delete('/:id', auth, deletePatient);  

module.exports = router;
