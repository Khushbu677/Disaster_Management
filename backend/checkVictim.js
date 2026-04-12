require('dotenv').config();
const connectDB = require('./config/db');
const Victim = require('./models/Victim');

(async () => {
  try {
    await connectDB();
    const docs = await Victim.find({ phone: '9999999993' }).select('name email location').lean();
    console.log(JSON.stringify(docs, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
