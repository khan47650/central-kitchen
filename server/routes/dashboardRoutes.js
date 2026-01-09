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
    const todaySlots = await Slot.find({ date: today });

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
    const endHour = 20;
    const workingDays = [1, 2, 3, 4];

    let totalFutureSlots = 0;

    for (let i = 0; i < 7; i++) {
      const day = moment.tz(AZ_TIMEZONE).startOf("week").add(i, "days");
      const dayNumber = day.isoWeekday(); 
      const dayStr = day.format("YYYY-MM-DD");

      // skip non working days
      if (!workingDays.includes(dayNumber)) continue;

      // skip past days
      if (day.isBefore(moment.tz(AZ_TIMEZONE), 'day')) continue;

      // today slots
      if (day.isSame(today, 'day')) {
        const currentHour = now.hour();
        for (let h = startHour; h < endHour; h++) {
          if (h > currentHour) totalFutureSlots++;
        }
      } else {
        totalFutureSlots += (endHour - startHour);
      }
    }

    // Count booked slots only from today → endOfWeek
    const bookedFutureSlots = await Slot.countDocuments({
      date: { $gte: today, $lte: endOfWeek },
      booked: true
    });

    const openSlots = totalFutureSlots - bookedFutureSlots;

    const currentWeekBookedSlots = await Slot.countDocuments({
      date: { $gte: startOfWeek, $lte: endOfWeek },
      booked: true
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

    // Approved users
    const approvedUsers = await User.find({
      status: 'approved',
      updatedAt: { $gte: startOfWeek, $lte: endOfWeek }
    }).select('fullName updatedAt');

    const approvedActivities = approvedUsers.map(u => ({
      user: u.fullName,
      action: 'Approved',
      date: u.updatedAt
    }));

    // Booked slots
    const bookedSlots = await Slot.find({
      booked: true,
      updatedAt: { $gte: startOfWeek, $lte: endOfWeek }
    });

    const bookedActivities = await Promise.all(
      bookedSlots.map(async (s) => {
        let userName = 'Admin';
        if (s.bookedBy && s.bookedBy !== 'Admin') {
          const user = await User.findById(s.bookedBy).select('fullName');
          userName = user?.fullName || 'Unknown';
        }

        return {
          user: userName,
          action: 'Booked',
          date: s.updatedAt,
          slotDate: s.date,
          slotTime: `${s.startTime} - ${s.endTime}`
        };
      })
    );

    const recentActivities = [...approvedActivities, ...bookedActivities]
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

router.get('/clientDashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const now = moment.tz(AZ_TIMEZONE);
    const startOfWeek = moment.tz(AZ_TIMEZONE).startOf('week').toDate();
    const endOfWeek = moment.tz(AZ_TIMEZONE).endOf('week').toDate();

    // Upcoming bookings
    const upcomingSlots = await Slot.find({ booked: true, bookedBy: userId, date: { $gte: now.format('YYYY-MM-DD'), $lte: moment(endOfWeek).format('YYYY-MM-DD') } });

    // Completed bookings
    const completedSlots = await Slot.find({ booked: true, bookedBy: userId, date: { $gte: moment(startOfWeek).format('YYYY-MM-DD'), $lte: now.format('YYYY-MM-DD') } })
      .then(slots => slots.filter(slot => moment.tz(`${slot.date} ${slot.endTime}`, 'YYYY-MM-DD HH:mm', AZ_TIMEZONE).isBefore(now)));

    // Recent bookings
    const recentBookings = await Slot.find({ bookedBy: userId, date: { $gte: moment(startOfWeek).format('YYYY-MM-DD'), $lte: moment(endOfWeek).format('YYYY-MM-DD') } })
      .sort({ date: -1, startTime: -1 });

    const recentBookingsMapped = recentBookings.map(slot => ({
      id: slot._id,
      service: getSlotType(parseInt(slot.startTime.split(':')[0])),
      date: `${slot.date} ${slot.startTime}`,
      status: slot.booked ? 'Booked' : 'Cancelled',
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

// GET client upcoming slots
router.get('/client/upcoming/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const now = moment.tz(AZ_TIMEZONE);

    const slots = await Slot.find({
      booked: true,
      bookedBy: userId,
    });

    const upcoming = slots.filter(slot => {
      const start = moment.tz(
        `${slot.date} ${slot.startTime}`,
        'YYYY-MM-DD HH:mm',
        AZ_TIMEZONE
      );
      return start.isAfter(now);
    });

    res.json(upcoming);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// GET client completed slots
router.get('/client/completed/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const now = moment.tz(AZ_TIMEZONE);

    const startOfWeek = moment.tz(AZ_TIMEZONE).startOf('week');
    const endOfWeek = moment.tz(AZ_TIMEZONE).endOf('week');

    const slots = await Slot.find({
      booked: true,
      bookedBy: userId,
      date: {
        $gte: startOfWeek.format('YYYY-MM-DD'),
        $lte: endOfWeek.format('YYYY-MM-DD'),
      }
    });

    const completedThisWeek = slots.filter(slot => {
      const end = moment.tz(
        `${slot.date} ${slot.endTime}`,
        'YYYY-MM-DD HH:mm',
        AZ_TIMEZONE
      );
      return end.isBefore(now);
    });

    res.json(completedThisWeek);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
