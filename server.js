const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const queueRoutes = require('./routes/queueRoutes');

const app = express();

app.use(cors());              
app.use(express.json());      

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/queue', queueRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: ' Hospital Queue Management API is running',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    
    await connectDB();

    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`\n Server running on http://localhost:${PORT}`);
      console.log(` API Base URL: http://localhost:${PORT}/api\n`);
    });
  } catch (error) {
    console.error(' Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
