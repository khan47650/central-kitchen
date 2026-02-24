const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const User = require('../models/User');
const moment = require('moment-timezone');

const AZ_TIMEZONE = 'America/Phoenix';

router.get('/adminStats', async (req, res) => {
  try {

    const now = moment.tz(AZ_TIMEZONE);
    const today = moment.tz(AZ_TIMEZONE).format("YYYY-MM-DD");

    // Todays appointments
    const todaySlots = await Slot.find({ date: today, unavailable: { $ne: true } });

    let completed = 0;
    let upcoming = 0;

    todaySlots.forEach(slot => {
      const slotEnd = moment.tz(
        `${slot.date} ${slot.endTime}`,
        "YYYY-MM-DD HH:mm",
        AZ_TIMEZONE
      );
      const slotStart = moment.tz(
        `${slot.date} ${slot.startTime}`,
        "YYYY-MM-DD HH:mm",
        AZ_TIMEZONE
      );

      if (slotEnd.isSameOrBefore(now)) completed++;
      else if (slotStart.isSameOrAfter(now)) upcoming++;
    });

    const todayAppointments = completed + upcoming;

    // current week pending and awaiting users
    const startOfWeek = moment.tz(AZ_TIMEZONE).startOf('week').format("YYYY-MM-DD");
    const endOfWeek = moment.tz(AZ_TIMEZONE).endOf('week').format("YYYY-MM-DD");

    const pendingThisWeek = await User.countDocuments({
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
      status: "pending",
    });

    const awaitingThisWeek = await User.countDocuments({
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
      status: "awaiting",
    });

    const totalPendingUsers = pendingThisWeek + awaitingThisWeek;

    // Active users
    const activeUsers = await User.countDocuments({ status: 'approved' });

    const newThisWeek = await User.countDocuments({
      createdAt: {
        $gte: moment.tz(AZ_TIMEZONE).startOf("day").toDate(),
        $lte: moment.tz(AZ_TIMEZONE).endOf("day").toDate()
      },
      status: "approved",
    });

    // Open slots
    const startHour = 6;
    const endHour = 22;
    const slotIntervalMinutes = 30;
    const workingDays = [1, 2, 3, 4, 5, 6, 7]; // Mon-Sun

    let totalFutureSlots = 0;

    for (let i = 0; i < 7; i++) {
      // Week starts Monday
      const day = moment.tz(AZ_TIMEZONE).startOf('isoWeek').add(i, 'days');
      const dayNumber = day.isoWeekday(); // 1=Mon ... 7=Sun

      if (!workingDays.includes(dayNumber)) continue; // skip non-working days
      if (day.isBefore(now, 'day')) continue; // skip past days

      let dayStart = moment.tz(day.format('YYYY-MM-DD') + ` ${startHour}:00`, 'YYYY-MM-DD HH:mm', AZ_TIMEZONE);
      let dayEnd = moment.tz(day.format('YYYY-MM-DD') + ` ${endHour}:00`, 'YYYY-MM-DD HH:mm', AZ_TIMEZONE);

      // Today → start from now or startHour whichever is later, rounded to next 30 min
      if (day.isSame(now, 'day')) {
        dayStart = moment.max(dayStart, now.clone());
        const minutesToAdd = slotIntervalMinutes - (dayStart.minute() % slotIntervalMinutes);
        dayStart.add(minutesToAdd, 'minutes');
      }

      const minutes = dayEnd.diff(dayStart, 'minutes');
      if (minutes > 0) totalFutureSlots += Math.floor(minutes / slotIntervalMinutes);
    }

    // Deduct booked slots from today → end of week
    const bookedFutureSlots = await Slot.countDocuments({
      date: { $gte: today, $lte: endOfWeek },
      unavailable: { $ne: true },
      $or: [
        { "sections.section1.booked": true },
        { "sections.section2.booked": true }
      ]
    });

    const openSlots = totalFutureSlots - bookedFutureSlots;

    const currentWeekBookedSlots = await Slot.countDocuments({
      date: { $gte: startOfWeek, $lte: endOfWeek },
      unavailable: { $ne: true },
      $or: [
        { "sections.section1.booked": true },
        { "sections.section2.booked": true }
      ]
    });

    res.json({
      todayAppointments: {
        total: todayAppointments,
        completed,
        upcoming,
      },
      pendingApprovals: {
        total: totalPendingUsers,
        pendingThisWeek,
        awaitingThisWeek,
      },
      activeUsers: {
        total: activeUsers,
        newThisWeek,
      },
      openSlots,
      currentWeekBookedSlots,
    });

  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// recent activities API
router.get('/recentActivities', async (req, res) => {
  try {
    const startOfWeek = moment.tz(AZ_TIMEZONE).startOf('week').toDate();
    const endOfWeek = moment.tz(AZ_TIMEZONE).endOf('week').toDate();

    // Approved users activity
    const approvedUsers = await User.find({
      status: 'approved',
      updatedAt: { $gte: startOfWeek, $lte: endOfWeek }
    }).select('fullName updatedAt');

    const approvedActivities = approvedUsers.map(u => ({
      user: u.fullName,
      action: 'Approved',
      date: u.updatedAt
    }));

    //BOOKED SLOTS BASED ON SECTIONS
    const bookedSlots = await Slot.find({
      unavailable: { $ne: true },
      updatedAt: { $gte: startOfWeek, $lte: endOfWeek },
      $or: [
        { "sections.section1.booked": true },
        { "sections.section2.booked": true }
      ]
    });

    const bookedActivities = await Promise.all(
      bookedSlots.flatMap(async (slot) => {
        const activities = [];

        // Helper function to get user name
        const getUserName = async (userId) => {
          if (!userId || userId === "Admin") return "Admin";
          const user = await User.findById(userId).select("fullName");
          return user?.fullName || "Unknown";
        };

        // Section 1
        if (slot.sections?.section1?.booked) {
          activities.push({
            user: await getUserName(slot.sections.section1.bookedBy),
            action: "Booked (Section 1)",
            date: slot.updatedAt,
            slotDate: slot.date,
            slotTime: `${slot.startTime} - ${slot.endTime}`
          });
        }

        // Section 2
        if (slot.sections?.section2?.booked) {
          activities.push({
            user: await getUserName(slot.sections.section2.bookedBy),
            action: "Booked (Section 2)",
            date: slot.updatedAt,
            slotDate: slot.date,
            slotTime: `${slot.startTime} - ${slot.endTime}`
          });
        }

        return activities;
      })
    );

    //Merge + sort
    const recentActivities = [...approvedActivities, ...bookedActivities.flat()]
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ recentActivities });

  } catch (err) {
    console.error("Recent activities error:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// ----------------------- Client APIs -----------------------
// Slot type 
const getSlotType = (hour) => {
  if (hour >= 6 && hour < 12) return 'Breakfast Slot';
  if (hour >= 12 && hour < 15) return 'Lunch Slot';
  if (hour >= 15) return 'Dinner Slot';
  return 'Unknown';
};

// Helper: check if user has booked any section in a slot
const isUserBookedSlot = (slot, userId) => {
  if (!slot.sections) return false;
  return ['section1', 'section2'].some(
    sec => slot.sections[sec]?.bookedBy === userId
  );
};

// ----------------------- Client Dashboard -----------------------
router.get('/clientDashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const now = moment.tz(AZ_TIMEZONE);
    const startOfWeek = moment.tz(AZ_TIMEZONE).startOf('week');
    const endOfWeek = moment.tz(AZ_TIMEZONE).endOf('week');

    // Upcoming bookings
    const upcomingSlotsRaw = await Slot.find({
      unavailable: { $ne: true },
      date: { $lte: endOfWeek.format('YYYY-MM-DD') }
    });

    const upcomingSlots = upcomingSlotsRaw.filter(slot => {
      if (!isUserBookedSlot(slot, userId)) return false;

      const slotStart = moment.tz(
        `${slot.date} ${slot.startTime}`,
        'YYYY-MM-DD HH:mm',
        AZ_TIMEZONE
      );

      return slotStart.isAfter(now);
    });

    // Completed bookings
    const completedSlotsRaw = await Slot.find({
      unavailable: { $ne: true },
      date: { $gte: startOfWeek.format('YYYY-MM-DD'), $lte: now.format('YYYY-MM-DD') }
    });

    const completedSlots = completedSlotsRaw.filter(slot => {
      const end = moment.tz(`${slot.date} ${slot.endTime}`, 'YYYY-MM-DD HH:mm', AZ_TIMEZONE);
      return end.isBefore(now) && isUserBookedSlot(slot, userId);
    });

    // Recent bookings
    const recentBookingsRaw = await Slot.find({
      unavailable: { $ne: true },
      date: { $gte: startOfWeek.format('YYYY-MM-DD'), $lte: endOfWeek.format('YYYY-MM-DD') }
    }).sort({ date: -1, startTime: -1 });

    const recentBookingsMapped = recentBookingsRaw
      .filter(slot => isUserBookedSlot(slot, userId))
      .map(slot => ({
        id: slot._id,
        service: getSlotType(parseInt(slot.startTime.split(':')[0])),
        date: `${slot.date} ${slot.startTime}`,
        status: 'Booked', // section booked means booked
      }));

    res.json({
      stats: { upcoming: upcomingSlots.length, completed: completedSlots.length, profileStatus: 'Verified' },
      recentBookings: recentBookingsMapped
    });

  } catch (err) {
    console.error("Client dashboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------- Client Upcoming Slots -----------------------
router.get('/client/upcoming/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const now = moment.tz(AZ_TIMEZONE);

    const slotsRaw = await Slot.find({ unavailable: { $ne: true } });

    const upcoming = slotsRaw.filter(slot => {
      const start = moment.tz(`${slot.date} ${slot.startTime}`, 'YYYY-MM-DD HH:mm', AZ_TIMEZONE);
      return start.isAfter(now) && isUserBookedSlot(slot, userId);
    });

    res.json(upcoming);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------- Client Completed Slots -----------------------
router.get('/client/completed/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const now = moment.tz(AZ_TIMEZONE);

    const startOfWeek = moment.tz(AZ_TIMEZONE).startOf('week');
    const endOfWeek = moment.tz(AZ_TIMEZONE).endOf('week');

    const slotsRaw = await Slot.find({
      unavailable: { $ne: true },
      date: { $gte: startOfWeek.format('YYYY-MM-DD'), $lte: endOfWeek.format('YYYY-MM-DD') }
    });

    const completedThisWeek = slotsRaw.filter(slot => {
      const end = moment.tz(`${slot.date} ${slot.endTime}`, 'YYYY-MM-DD HH:mm', AZ_TIMEZONE);
      return end.isBefore(now) && isUserBookedSlot(slot, userId);
    });

    res.json(completedThisWeek);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;