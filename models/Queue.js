const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
    },
    tokenNumber: {
      type: Number,
      required: [true, 'Token number is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Waiting', 'In Progress', 'Completed'],
        message: 'Status must be Waiting, In Progress, or Completed',
      },
      default: 'Waiting',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Queue', queueSchema);
