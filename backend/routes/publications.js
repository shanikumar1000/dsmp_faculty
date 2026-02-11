const express = require('express');
const router = express.Router();
const { createPublication, getPublicationsByFaculty } = require('../controllers/publicationController');

router.post('/', createPublication);
router.get('/:faculty_id', getPublicationsByFaculty);

module.exports = router;
