const Doctor = require('../models/Doctor');

exports.getDoctors = async (req, res, next) => {
  try {
    const { search } = req.query;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },            
          { specialization: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const doctors = await Doctor.find(filter)
      .select('-password')   
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({ success: true, doctor });
  } catch (error) {
    next(error);
  }
};

exports.createDoctor = async (req, res, next) => {
  try {
    const { name, specialization, email, password, available } = req.body;

    if (!name || !specialization || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, specialization, email, and password',
      });
    }

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'A doctor with this email already exists',
      });
    }

    const doctor = await Doctor.create({
      name,
      specialization,
      email,
      password,
      available: available !== undefined ? available : true,
    });

    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      doctor: doctorResponse,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDoctor = async (req, res, next) => {
  try {
    const { name, specialization, email, available } = req.body;

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    if (name !== undefined) doctor.name = name;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (email !== undefined) doctor.email = email;
    if (available !== undefined) doctor.available = available;

    await doctor.save();

    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      doctor: doctorResponse,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    await Doctor.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
