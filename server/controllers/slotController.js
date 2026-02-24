const Slot = require('../models/Slot');
const moment = require('moment-timezone');

const AZ_TIMEZONE = 'America/Phoenix';

// Convert HH:mm → total minutes
const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// Convert total minutes → HH:mm
const toHHMM = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

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

    // Calculate times
    const startMinutes = toMinutes(startTime);
    const endMinutes = startMinutes + duration * 60;
    const endTime = toHHMM(endMinutes);

    // Get all slots of that day
    const daySlots = await Slot.find({ date });

    // Overlap check
    const overlapping = daySlots.some(s => {
      if (s.startTime === startTime && s.endTime === endTime) return false;
      return startMinutes < toMinutes(s.endTime) && endMinutes > toMinutes(s.startTime);
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
      sections: {
        section1: {},
        section2: {}
      }
    });

    res.status(201).json({ slot });

  } catch (err) {
    console.error("Create Slot Error:", err);
    res.status(500).json({ error: 'Slot creation failed' });
  }
};


// Book slot
// exports.bookSlot = async (req, res) => {
//   try {
//     const { slotId, userId, isAdmin, duration, makeUnavailable } = req.body;

//     if (!slotId || !duration)
//       return res.status(400).json({ error: 'Missing slotId or duration' });

//     if (!isAdmin && !userId)
//       return res.status(400).json({ error: 'Missing userId' });

//     const slot = await Slot.findById(slotId);
//     if (!slot) return res.status(404).json({ error: 'Slot not found' });

//     if (slot.booked && !makeUnavailable)
//       return res.status(409).json({ error: 'Slot already booked' });

//     if (slot.unavailable && !makeUnavailable)
//       return res.status(403).json({ error: 'Slot unavailable' });

//     // Time validation (past slot)
//     const slotStart = moment.tz(
//       `${slot.date} ${slot.startTime}`,
//       'YYYY-MM-DD HH:mm',
//       AZ_TIMEZONE
//     );

//     if (slotStart.isBefore(moment.tz(AZ_TIMEZONE)))
//       return res.status(400).json({ error: 'Cannot book past slot' });

//     // Calculate end time
//     const startMinutes = toMinutes(slot.startTime);
//     const endMinutes = startMinutes + duration * 60;
//     const endTime = toHHMM(endMinutes);

//     // Check overlap with other slots
//     const daySlots = await Slot.find({ date: slot.date, _id: { $ne: slotId } });

//     const overlapping = daySlots.some(s => {
//       const sStart = toMinutes(s.startTime);
//       const sEnd = toMinutes(s.endTime);
//       return startMinutes < sEnd && endMinutes > sStart;
//     });

//     if (overlapping) {
//       return res.status(409).json({ error: 'Slot overlaps with another slot' });
//     }

//     // Admin makes unavailable
//     if (isAdmin && makeUnavailable === true) {
//       slot.unavailable = true;
//       slot.booked = false;
//       slot.bookedBy = 'Admin';
//       slot.endTime = endTime;
//     }
//     // Normal booking
//     else {
//       slot.booked = true;
//       slot.unavailable = false;
//       slot.bookedBy = isAdmin ? 'Admin' : userId;
//       slot.endTime = endTime;
//     }

//     await slot.save();

//     res.status(200).json({ success: true, slot });

//   } catch (err) {
//     console.error("Booking error:", err);
//     res.status(500).json({ error: 'Booking failed' });
//   }
// };
exports.bookSlot = async (req, res) => {
  try {
    const { date, startTime, duration, userId, section, isAdmin } = req.body;

    if (!date || !startTime || !duration)
      return res.status(400).json({ error: "Missing fields" });

    if (!isAdmin && !userId)
      return res.status(400).json({ error: "Missing userId" });

    // Compute end time
    const startMinutes = toMinutes(startTime);
    const endMinutes = startMinutes + duration * 60;
    const endTime = toHHMM(endMinutes);

    // Find or create slot
    let slot = await Slot.findOne({ date, startTime });
    if (!slot) {
      slot = await Slot.create({
        date,
        startTime,
        endTime,
        unavailable: false,
        sections: {
          section1: { booked: false, bookedBy: null },
          section2: { booked: false, bookedBy: null }
        }
      });
    }

    // Ensure sections exist
    slot.sections = slot.sections || {};
    slot.sections.section1 = slot.sections.section1 || { booked: false, bookedBy: null };
    slot.sections.section2 = slot.sections.section2 || { booked: false, bookedBy: null };

    // Validate booking
    if (slot.unavailable) return res.status(403).json({ error: "Slot unavailable" });
    if (slot.sections.section1.booked && slot.sections.section2.booked)
      return res.status(409).json({ error: "Slot fully booked" });
    if (slot.sections[section].booked)
      return res.status(409).json({ error: "Section already booked" });

    // Book section
    slot.sections[section].booked = true;
    slot.sections[section].bookedBy = isAdmin ? "Admin" : userId;
    slot.endTime = endTime;

    await slot.save();

    res.json({ success: true, slot });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Booking failed" });
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

    const slots = await Slot.find({
      $or: [
        { "sections.section1.bookedBy": userId },
        { "sections.section2.bookedBy": userId }
      ], unavailable: { $ne: true }
    });
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

// Clear section OR delete slot if empty
exports.clearSection = async (req, res) => {
  try {
    const { slotId, section, userId, isAdmin } = req.body;

    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ error: "Slot not found" });

    const sec = slot.sections[section];

    // Already empty
    if (!sec.booked) {
      return res.status(400).json({ error: "Section already empty" });
    }

    // Ensure section exists
    if (!slot.sections[section]) return res.status(400).json({ error: "Invalid section" });

    // Client security check
    if (!isAdmin && slot.sections[section].bookedBy !== userId) {
      return res.status(403).json({ error: "Not your booking" });
    }

    // Clear section
    slot.sections[section].booked = false;
    slot.sections[section].bookedBy = null;

    // If both sections empty → delete slot
    if (!slot.sections.section1.booked && !slot.sections.section2.booked) {
      await Slot.findByIdAndDelete(slotId);
      return res.json({ deleted: true });
    }

    await slot.save();
    res.json({ success: true, slot });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
};
// GET slot by ID
exports.getSlotById=async (req, res) => {
  try {
    const { slotId } = req.params;
    if(!slotId) return res.status(404).json({ message: 'SlotId not found' });

    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    res.json(slot);
  } catch (err) {
    console.error('Error fetching slot:', err);
    res.status(500).json({ message: 'Server error' });
  }
};