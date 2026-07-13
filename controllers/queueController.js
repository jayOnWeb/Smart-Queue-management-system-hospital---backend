const Queue = require('../models/Queue');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

exports.getQueues = async (req, res, next) => {
  try {
    const { status, doctor, sort, search } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (doctor) filter.doctor = doctor;

    let sortOrder = { createdAt: -1 };
    if (sort === 'oldest') sortOrder = { createdAt: 1 };

    let queues = await Queue.find(filter)
      .populate('patient', 'name age gender phone')   
      .populate('doctor', 'name specialization email') 
      .sort(sortOrder);

    if (search) {
      const searchLower = search.toLowerCase();
      queues = queues.filter(
        (q) => q.patient && q.patient.name.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({
      success: true,
      count: queues.length,
      queues,
    });
  } catch (error) {
    next(error);
  }
};

exports.createQueue = async (req, res, next) => {
  try {
    const { patient, doctor: doctorId } = req.body;

    if (!patient || !doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patient and doctor IDs',
      });
    }

    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    const doctorExists = await Doctor.findById(doctorId);
    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lastQueue = await Queue.findOne({
      doctor: doctorId,
      createdAt: { $gte: today, $lt: tomorrow },
    }).sort({ tokenNumber: -1 });

    const tokenNumber = lastQueue ? lastQueue.tokenNumber + 1 : 1;

    const queue = await Queue.create({
      patient,
      doctor: doctorId,
      tokenNumber,
    });

    const populatedQueue = await Queue.findById(queue._id)
      .populate('patient', 'name age gender phone')
      .populate('doctor', 'name specialization email');

    res.status(201).json({
      success: true,
      message: `Queue entry created — Token #${tokenNumber}`,
      queue: populatedQueue,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateQueueStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status',
      });
    }

    const validStatuses = ['Waiting', 'In Progress', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Waiting, In Progress, or Completed',
      });
    }

    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found',
      });
    }

    queue.status = status;
    await queue.save();

    const updatedQueue = await Queue.findById(queue._id)
      .populate('patient', 'name age gender phone')
      .populate('doctor', 'name specialization email');

    res.status(200).json({
      success: true,
      message: `Queue status updated to "${status}"`,
      queue: updatedQueue,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteQueue = async (req, res, next) => {
  try {
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found',
      });
    }

    await Queue.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Queue entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.getDoctorQueue = async (req, res, next) => {
  try {
    const { status } = req.query;

    let filter = { doctor: req.user.id };
    if (status) filter.status = status;

    const queues = await Queue.find(filter)
      .populate('patient', 'name age gender phone')
      .populate('doctor', 'name specialization email')
      .sort({ tokenNumber: 1 }); 

    res.status(200).json({
      success: true,
      count: queues.length,
      queues,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalDoctors, totalPatients, waitingCount, completedToday, recentActivity] =
      await Promise.all([
        Doctor.countDocuments(),
        Patient.countDocuments(),
        Queue.countDocuments({ status: 'Waiting' }),
        Queue.countDocuments({
          status: 'Completed',
          updatedAt: { $gte: today, $lt: tomorrow },
        }),
        Queue.find()
          .populate('patient', 'name age gender phone')
          .populate('doctor', 'name specialization')
          .sort({ createdAt: -1 })
          .limit(10), 
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalDoctors,
        totalPatients,
        waitingCount,
        completedToday,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};
