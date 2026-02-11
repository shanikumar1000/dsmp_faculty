const express = require('express');
const router = express.Router();
const { createFaculty, getFaculty } = require('../controllers/facultyController');

router.post('/', createFaculty);
router.get('/:id', getFaculty);

module.exports = router;
