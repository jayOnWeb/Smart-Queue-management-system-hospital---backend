const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

exports.login = async (req, res, next) => {
  try {
    const { email: rawEmail, password, role } = req.body;
    const email = rawEmail?.toLowerCase().trim();

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and role',
      });
    }

    let user;
    if (role === 'admin') {
      user = await Admin.findOne({ email });
    } else if (role === 'doctor') {
      user = await Doctor.findOne({ email });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Role must be "admin" or "doctor"',
      });
    }

    if (!user) {
      console.log(`[LOGIN FAILED] No ${role} found with email: "${email}"`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`[LOGIN FAILED] Password mismatch for ${role}: "${email}"`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    console.log(`[LOGIN SUCCESS] User logged in: "${email}" (${role})`);
    
    const token = generateToken(user._id, role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email: rawEmail, password } = req.body;
    const email = rawEmail?.toLowerCase().trim();

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An admin with this email already exists',
      });
    }

    const admin = await Admin.create({ name, email, password });

    const token = generateToken(admin._id, 'admin');

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    let user;

    if (req.user.role === 'admin') {
      user = await Admin.findById(req.user.id).select('-password');
    } else if (req.user.role === 'doctor') {
      user = await Doctor.findById(req.user.id).select('-password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        role: req.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide old password and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    let user;
    if (req.user.role === 'admin') {
      user = await Admin.findById(req.user.id);
    } else if (req.user.role === 'doctor') {
      user = await Doctor.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
