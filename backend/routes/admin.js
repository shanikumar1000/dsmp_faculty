const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getPublicationTrends,
  getDepartmentPerformance,
  getTopFaculty,
  getRecentActivities,
  createFaculty,
  getAllFaculty,
  getAllActivities,
  updateActivityStatus
} = require('../controllers/adminController');

router.get('/stats', getAdminStats);
router.get('/publication-trends', getPublicationTrends);
router.get('/department-performance', getDepartmentPerformance);
router.get('/top-faculty', getTopFaculty);
router.get('/recent-activities', getRecentActivities);
router.get('/faculty', getAllFaculty);
router.get('/activities', getAllActivities);
router.post('/create-faculty', createFaculty);
router.patch('/activities/:id/status', updateActivityStatus);

module.exports = router;

