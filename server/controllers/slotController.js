const Slot = require('../models/Slot');
const moment = require('moment-timezone');

const AZ_TIMEZONE = 'America/Phoenix';

// Get all slots
exports.getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.find();
    res.status(200).json(slots);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
};

// Create slot
exports.createSlot = async (req, res) => {
  try {
    const { date, startTime, duration } = req.body;
    if (!date || !startTime || !duration)
      return res.status(400).json({ error: 'Missing fields' });

    const [hour] = startTime.split(':');
    const endHour = parseInt(hour) + parseInt(duration);
    const endTime = `${endHour}:00`;

    // Overlap Check
    const overlapping = await Slot.findOne({
      date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (overlapping)
      return res.status(409).json({ error: 'Slot overlaps with existing slot' });

    const slot = await Slot.create({ date, startTime, endTime });
    res.status(201).json({ slot });
  } catch (err) {
    res.status(500).json({ error: 'Slot creation failed' });
  }
};

// Book slot
exports.bookSlot = async (req, res) => {
  try {
    const { slotId, userId, isAdmin, duration } = req.body;

    if (!slotId || !duration)
      return res.status(400).json({ error: 'Missing slotId or duration' });

    if (!isAdmin && !userId)
      return res.status(400).json({ error: 'Missing userId for client booking' });

    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.booked) return res.status(409).json({ error: 'Slot already booked' });

    //Arizona timezone comparison
    const slotStart = moment.tz(
      `${slot.date} ${slot.startTime}`,
      'YYYY-MM-DD HH:mm',
      AZ_TIMEZONE
    );

    const now = moment.tz(AZ_TIMEZONE);

    if (slotStart.isBefore(now))
      return res.status(400).json({ error: 'Cannot book a slot in the past' });

    const [hour] = slot.startTime.split(':');
    const endHour = parseInt(hour) + parseInt(duration);
    const endTime = `${endHour}:00`;

    // Overlap check
    const overlapping = await Slot.findOne({
      date: slot.date,
      _id: { $ne: slotId },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: slot.startTime } }
      ]
    });

    if (overlapping)
      return res.status(409).json({ error: 'Slot overlaps with existing slot' });

    slot.booked = true;
    slot.bookedBy = isAdmin ? 'Admin' : userId;
    slot.endTime = endTime;
    await slot.save();

    res.status(200).json({ success: true, slot });

  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Booking failed' });
  }
};

// Get future slots
exports.getFutureSlots = async (req, res) => {
  try {
    const now = moment.tz(AZ_TIMEZONE);

    const slots = await Slot.find();
    const futureSlots = slots.filter(slot => {
      const slotStart = moment.tz(
        `${slot.date} ${slot.startTime}`,
        'YYYY-MM-DD HH:mm',
        AZ_TIMEZONE
      );
      return slotStart.isAfter(now);
    });

    res.status(200).json(futureSlots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch future slots' });
  }
};

// Get my slots
exports.getMySlots = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const slots = await Slot.find({ bookedBy: userId });
    res.status(200).json(slots);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user slots' });
  }
};

// Delete a slot
exports.deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    if (!slotId) return res.status(400).json({ error: 'Missing slotId' });

    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    await Slot.findByIdAndDelete(slotId);
    res.status(200).json({ success: true, message: 'Slot cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel slot' });
  }
};
