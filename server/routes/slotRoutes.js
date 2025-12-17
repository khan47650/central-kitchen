const express = require('express');
const router = express.Router();
const { getAllSlots, createSlot, bookSlot,getFutureSlots,getMySlots,deleteSlot } = require('../controllers/slotController');

router.get('/', getAllSlots);
router.post('/create', createSlot);
router.post('/book', bookSlot);
router.get('/future', getFutureSlots);
router.get('/my/:userId',getMySlots);
router.delete('/delete/:slotId',deleteSlot);

module.exports = router;