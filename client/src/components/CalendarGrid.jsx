import React from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment-timezone';

const AZ_TIMEZONE = 'America/Phoenix';

// Time slots in 24-hour for logic, but displayed as 12-hour
const timeSlots = [];
for (let hour = 6; hour <= 20; hour++) {
  timeSlots.push(`${hour}:00`);
  if (hour < 20) timeSlots.push(`${hour}:30`); // avoid 20:30
}

// Convert 24-hour time to 12-hour AM/PM
const formatTime12Hour = (time24) => {
  const [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // convert 0 to 12
  return `${hour}:${minute} ${ampm}`;
};

const CalendarGrid = ({ selectedWeek, slots = [], users = {}, onEmptyCellClick, onBookedCellClick }) => {
  const startOfWeek = moment
    .tz(selectedWeek, AZ_TIMEZONE)
    .startOf('week')
    .add(1, 'day'); // Monday

  const days = [0, 1, 2, 3].map(i =>
    moment(startOfWeek).add(i, 'days')
  );

  const now = moment.tz(AZ_TIMEZONE);

  const getSlotForCell = (day, slotTime) => {
    const slotMoment = moment.tz(
      `${day.format('YYYY-MM-DD')} ${slotTime}`,
      'YYYY-MM-DD H:mm',
      AZ_TIMEZONE
    );

    return slots.find(s => {
      const start = moment.tz(`${s.date} ${s.startTime}`, 'YYYY-MM-DD H:mm', AZ_TIMEZONE);
      const end = moment.tz(`${s.date} ${s.endTime}`, 'YYYY-MM-DD H:mm', AZ_TIMEZONE);
      return slotMoment.isSameOrAfter(start) && slotMoment.isBefore(end);
    });
  };

  const isPastSlot = (day, slotTime) => {
    const slotDateTime = moment.tz(
      `${day.format('YYYY-MM-DD')} ${slotTime}`,
      'YYYY-MM-DD HH:mm',
      AZ_TIMEZONE
    );
    return slotDateTime.isBefore(now);
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '90px repeat(4, minmax(160px, 1fr))',
          minWidth: 800,
          gap: '4px',
        }}
      >
        <Typography
          fontWeight="bold"
          sx={{
            position: 'sticky',
            left: 0,
            zIndex: 3,
            background: '#fff',
          }}
        >
          Time
        </Typography>

        {days.map((day, i) => (
          <Typography key={i} fontWeight="bold" textAlign="center">
            {day.format('ddd, MMM D')}
          </Typography>
        ))}

        {timeSlots.map((slot, i) => (
          <React.Fragment key={i}>
            <Typography
              sx={{
                position: 'sticky',
                left: 3,
                zIndex: 2,
                background: '#fff',
                fontSize: 14,
              }}
            >
              {formatTime12Hour(slot)} {/* <-- Changed to 12-hour display */}
            </Typography>

            {days.map((day, j) => {
              const bookedSlot = getSlotForCell(day, slot);
              const pastSlot = isPastSlot(day, slot);

              return (
                <Box
                  key={j}
                  onClick={() => {
                    if (bookedSlot) {
                      // 🔹 Unavailable slot → clickable for Admin only
                      if (bookedSlot.unavailable) {
                        onBookedCellClick?.(bookedSlot);
                        return; // normal users can’t click
                      }

                      // 🔹 Normal booked slot (admin or client)
                      onBookedCellClick?.(bookedSlot);
                      return;
                    }

                    // 🔹 Empty & not past slot
                    if (!bookedSlot && !pastSlot) {
                      onEmptyCellClick({
                        date: day.format('YYYY-MM-DD'),
                        startTime: slot, // 24-hour for backend
                      });
                    }
                  }}
                  sx={{
                    height: 40,
                    border: '1px solid #ccc',
                    backgroundColor: bookedSlot
                      ? bookedSlot.unavailable
                        ? '#cccccc' // gray for unavailable
                        : '#fde613' // yellow for normal admin or client booking
                      : pastSlot
                        ? '#e0e0e0'
                        : '#fff',

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,

                    cursor: bookedSlot
                      ? bookedSlot.unavailable
                        ? 'pointer' // Admin can click unavailable
                        : 'pointer' // normal booked
                      : pastSlot
                        ? 'not-allowed'
                        : 'pointer',

                    color: bookedSlot
                      ? bookedSlot.unavailable
                        ? '#555'
                        : '#000'
                      : pastSlot
                        ? '#999'
                        : '#000',

                    '&:hover': {
                      backgroundColor:
                        !bookedSlot && !pastSlot ? '#e3f2fd' : undefined,
                    },
                  }}
                >
                  {bookedSlot
                    ? bookedSlot.unavailable
                      ? 'Unavailable'
                      : bookedSlot.bookedBy === 'Admin'
                        ? 'Admin'
                        : users[bookedSlot.bookedBy]?.businessName || 'User'
                    : ''}
                </Box>



              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default CalendarGrid;
