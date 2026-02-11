const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const facultyRoutes = require('./routes/faculty');
const activitiesRoutes = require('./routes/activities');
const publicationsRoutes = require('./routes/publications');
const scholarRoutes = require('./routes/scholar');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const reportRoutes = require('./routes/report');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/publications', publicationsRoutes);
app.use('/api/scholar', scholarRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/report', reportRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Faculty Performance Management System API' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 API ready at http://localhost:${PORT}`);
});
