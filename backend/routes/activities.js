const express = require('express');
const router = express.Router();
const { createActivity, getActivitiesByFaculty } = require('../controllers/activityController');

router.post('/', createActivity);
router.get('/:faculty_id', getActivitiesByFaculty);

module.exports = router;
