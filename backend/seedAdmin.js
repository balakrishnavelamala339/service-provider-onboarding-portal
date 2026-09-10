
// Run once with: node seedAdmin.js
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const run = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || 'admin@onboarding.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }

  await User.create({ name: 'Admin', email, password, role: 'admin' });
  console.log('Admin created ->', email, '/', password);
  process.exit(0);
};

run();
