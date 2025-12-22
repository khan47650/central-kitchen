import React from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment-timezone';

const AZ_TIMEZONE = 'America/Phoenix';

const timeSlots = [
  '6:00','7:00','8:00','9:00',
  '10:00','11:00','12:00','13:00','14:00',
  '15:00','16:00','17:00','18:00','19:00','20:00'
];

const CalendarGrid = ({ selectedWeek, slots = [], users = {} }) => {
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
        {/* ===== HEADER ===== */}
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

        {/* ===== BODY ===== */}
        {timeSlots.map((slot, i) => (
          <React.Fragment key={i}>
            {/* Time column (sticky) */}
            <Typography
              sx={{
                position: 'sticky',
                left: 3,
                zIndex: 2,
                background: '#fff',
                fontSize: 14,
              }}
            >
              {slot}
            </Typography>

            {days.map((day, j) => {
              const bookedSlot = getSlotForCell(day, slot);
              const pastSlot = isPastSlot(day, slot);
              const showName = bookedSlot && slot === bookedSlot.startTime;

              return (
                <Box
                  key={j}
                  sx={{
                    height: 40,
                    border: '1px solid #ccc',
                    backgroundColor: bookedSlot
                      ? '#fde613'
                      : pastSlot
                      ? '#e0e0e0'
                      : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    cursor: bookedSlot || pastSlot ? 'not-allowed' : 'pointer',
                    color: pastSlot ? '#999' : '#000',
                  }}
                >
                  {showName
                    ? bookedSlot.bookedBy === 'Admin'
                      ? 'Admin'
                      : users[bookedSlot.bookedBy] || 'User'
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
