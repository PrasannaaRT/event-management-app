const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config(); 

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const checkoutRoutes = require('./routes/checkout');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews'); // 1. Import review routes
const organizerRoutes = require('./routes/organizer');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(cors());

app.use('/api/checkout', checkoutRoutes);

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes); // 2. Use review routes
app.use('/api/organizers', organizerRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('Event Management API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});