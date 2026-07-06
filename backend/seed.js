const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding...');

    const adminExists = await User.findOne({ email: 'admin@retail.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        name: 'Store Admin',
        email: 'admin@retail.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      console.log('Default Admin created! Email: admin@retail.com | Password: admin123');
    } else {
      console.log('Admin already exists.');
    }

    const cashierExists = await User.findOne({ email: 'cashier@retail.com' });
    if (!cashierExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('cashier123', salt);
      await User.create({
        name: 'Main Cashier',
        email: 'cashier@retail.com',
        password: hashedPassword,
        role: 'user',
        status: 'active'
      });
      console.log('Default Cashier created! Email: cashier@retail.com | Password: cashier123');
    } else {
      console.log('Cashier already exists.');
    }

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();
