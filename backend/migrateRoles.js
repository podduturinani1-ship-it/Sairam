import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const result1 = await User.updateMany({ role: 'super_admin' }, { role: 'boss' });
    console.log('Updated super_admin to boss:', result1.modifiedCount);

    const result2 = await User.updateMany({ role: 'delivery_partner' }, { role: 'driver' });
    console.log('Updated delivery_partner to driver:', result2.modifiedCount);

    const result3 = await User.updateMany({ role: 'kitchen_staff' }, { role: 'kitchen' });
    console.log('Updated kitchen_staff to kitchen:', result3.modifiedCount);

    console.log('Migration Complete');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed', error);
    process.exit(1);
  }
};

migrate();
