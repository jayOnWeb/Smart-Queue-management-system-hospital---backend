const Patient = require('../models/Patient');

exports.getPatients = async (req, res, next) => {
  try {
    const { search } = req.query;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const patients = await Patient.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    res.status(200).json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

exports.createPatient = async (req, res, next) => {
  try {
    const { name, age, gender, phone } = req.body;

    if (!name || age === undefined || !gender || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, age, gender, and phone',
      });
    }

    const patient = await Patient.create({ name, age, gender, phone });

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      patient,
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const { name, age, gender, phone } = req.body;

    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    if (name !== undefined) patient.name = name;
    if (age !== undefined) patient.age = age;
    if (gender !== undefined) patient.gender = gender;
    if (phone !== undefined) patient.phone = phone;

    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      patient,
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    await Patient.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
