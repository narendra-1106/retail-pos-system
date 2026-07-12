const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      password: String,
      role: String,
      name: String,
      status: String
    }, { strict: false }));
    
    const email = 'narendra1jagtap@gmail.com';
    const hashedPassword = await bcrypt.hash('1234', 10);
    
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { $set: { password: hashedPassword, role: 'admin', status: 'active' } },
      { new: true, upsert: true }
    );
    
    console.log('User updated successfully:', updatedUser.email, updatedUser.role);
  } catch(err) {
    console.error('Error:', err);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
});
