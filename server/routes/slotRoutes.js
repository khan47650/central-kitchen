const express = require('express');
const router = express.Router();
const { getAllSlots, createSlot, bookSlot,getFutureSlots,getMySlots,deleteSlot,clearSection,getSlotById } = require('../controllers/slotController');

router.get('/', getAllSlots);
router.post('/create', createSlot);
router.post('/book', bookSlot);
router.get('/future', getFutureSlots);
router.get('/my/:userId',getMySlots);
router.delete('/delete/:slotId',deleteSlot);
router.post("/clear-section", clearSection);
router.get('/:slotId',getSlotById);

module.exports = router;