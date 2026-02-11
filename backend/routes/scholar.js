const express = require('express');
const router = express.Router();
const { syncScholarData } = require('../controllers/scholarController');

router.post('/sync', syncScholarData);

module.exports = router;
