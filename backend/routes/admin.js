const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getPublicationTrends,
  getDepartmentPerformance,
  getTopFaculty,
  getRecentActivities
} = require('../controllers/adminController');

router.get('/stats', getAdminStats);
router.get('/publication-trends', getPublicationTrends);
router.get('/department-performance', getDepartmentPerformance);
router.get('/top-faculty', getTopFaculty);
router.get('/recent-activities', getRecentActivities);

module.exports = router;
