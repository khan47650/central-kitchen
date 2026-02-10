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
    const { date, startTime, duration, makeUnavailable } = req.body;

    if (!date || !startTime || !duration)
      return res.status(400).json({ error: 'Missing fields' });

    // Convert HH:mm to minutes
    const toMinutes = (time) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const startMinutes = toMinutes(startTime);
    const endMinutes = startMinutes + parseInt(duration) * 60;

    const endHour = Math.floor(endMinutes / 60);
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;

    // Fetch all slots for that date
    const daySlots = await Slot.find({ date });

    // Check overlap with unavailable slots
    const overlapsUnavailable = daySlots.some(slot => {
      if (!slot.unavailable) return false;

      const slotStart = toMinutes(slot.startTime);
      const slotEnd = toMinutes(slot.endTime);

      return (
        startMinutes < slotEnd &&
        endMinutes > slotStart
      );
    });

    if (overlapsUnavailable) {
      return res.status(409).json({
        error: 'Cannot create slot: overlaps with unavailable slot'
      });
    }

    // Check overlap with ANY slot
    const overlapping = daySlots.some(slot => {
      const slotStart = toMinutes(slot.startTime);
      const slotEnd = toMinutes(slot.endTime);

      return (
        startMinutes < slotEnd &&
        endMinutes > slotStart
      );
    });

    if (overlapping) {
      return res.status(409).json({ error: 'Slot overlaps with existing slot' });
    }

    // Create slot
    const slot = await Slot.create({
      date,
      startTime,
      endTime,
      unavailable: makeUnavailable === true,
      booked: false
    });

    res.status(201).json({ slot });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Slot creation failed' });
  }
};


// Book slot
exports.bookSlot = async (req, res) => {
  try {
    const {
      slotId,
      userId,
      isAdmin,
      duration,
      makeUnavailable
    } = req.body;

    if (!slotId || !duration)
      return res.status(400).json({ error: 'Missing slotId or duration' });

    if (!isAdmin && !userId)
      return res.status(400).json({ error: 'Missing userId for client booking' });

    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    if (isAdmin && makeUnavailable === true && slot.booked) {
      return res.status(409).json({
        error: 'Please delete the existing slot first'
      });
    }


    if (slot.unavailable && !makeUnavailable)
      return res.status(403).json({ error: 'Slot is unavailable' });


    if (slot.booked)
      return res.status(409).json({ error: 'Slot already booked' });


    // Arizona timezone check
    const slotStart = moment.tz(
      `${slot.date} ${slot.startTime}`,
      'YYYY-MM-DD HH:mm',
      AZ_TIMEZONE
    );

    const now = moment.tz(AZ_TIMEZONE);
    if (slotStart.isBefore(now))
      return res.status(400).json({ error: 'Cannot book a slot in the past' });

    // endTime calculate
    const [hour] = slot.startTime.split(':');
    const endHour = parseInt(hour) + parseInt(duration);
    const endTime = `${endHour}:00`;

    //Overlap check
    const overlapping = await Slot.findOne({
      date: slot.date,
      _id: { $ne: slotId },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: slot.startTime } }
      ]
    });

    if (overlapping) {
      if (isAdmin && makeUnavailable === true) {
        return res.status(409).json({
          error: 'Please delete the existing slot first'
        });
      }

      return res.status(409).json({
        error: 'Slot overlaps with existing slot'
      });
    }


    //Admin marks slot unavailable
    if (isAdmin && makeUnavailable === true) {
      slot.unavailable = true;
      slot.booked = false;
      slot.bookedBy = 'Admin';
      slot.endTime = endTime;
    }
    //Normal booking (admin ya client)
    else {
      slot.booked = true;
      slot.unavailable = false;
      slot.bookedBy = isAdmin ? 'Admin' : userId;
      slot.endTime = endTime;
    }

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

    const slots = await Slot.find({ unavailable: { $ne: true } });
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

    const slots = await Slot.find({ bookedBy: userId, unavailable: { $ne: true } });
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
