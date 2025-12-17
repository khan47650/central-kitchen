const express = require('express');
const router = express.Router();
const { createContact, getContacts } = require('../controllers/contactController');


//save contact
router.post('/', createContact);

//get contects
router.get('/', getContacts);

module.exports = router;