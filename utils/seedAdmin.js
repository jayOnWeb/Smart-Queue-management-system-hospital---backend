const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();

    if (adminCount === 0) {
      
      await Admin.create({
        name: 'Hospital Admin',
        email: 'admin@hospital.com',
        password: 'admin123', 
      });

      console.log(' Default admin account created:');
      console.log('   Email:    admin@hospital.com');
      console.log('   Password: admin123');
    } else {
      console.log(' Admin account already exists — skipping seed');
    }
  } catch (error) {
    console.error(' Error seeding admin:', error.message);
  }
};

module.exports = seedAdmin;
