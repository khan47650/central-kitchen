import React from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment-timezone';
import { useAuth } from '../context/AuthContext';

const AZ_TIMEZONE = 'America/Phoenix';

// Time slots in 24-hour for logic, but displayed as 12-hour
const timeSlots = [];
for (let hour = 6; hour <= 22; hour++) {
  timeSlots.push(`${hour}:00`);
  if (hour < 22) timeSlots.push(`${hour}:30`);
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

  const days = [0, 1, 2, 3, 4, 5, 6].map(i =>
    moment(startOfWeek).add(i, 'days')
  );

  const now = moment.tz(AZ_TIMEZONE);
  const {user}=useAuth();

  const getSlotsForCell = (day, slotTime) => {
    const slotMoment = moment.tz(
      `${day.format('YYYY-MM-DD')} ${slotTime}`,
      'YYYY-MM-DD H:mm',
      AZ_TIMEZONE
    );

    return slots.filter(s => {
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
          gridTemplateColumns: '90px repeat(7, minmax(160px, 1fr))',
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
                mt: 1.2,
                fontWeight: "bold"
              }}
            >
              {formatTime12Hour(slot)}
            </Typography>

            {days.map((day, j) => {
              const bookedSlots = getSlotsForCell(day, slot);
              const pastSlot = isPastSlot(day, slot);
              const isDisabledSlot = slot === '22:00';

              return (
                <Box
                  key={j}
                  onClick={() => {
                    if (isDisabledSlot) return;

                    if (bookedSlots.length) {
                      const slotData = bookedSlots[0];

                      const s1 = slotData.sections.section1;
                      const s2 = slotData.sections.section2;

                      const myId = user?._id; // ya props me bhejo
                      const isAdmin = user.role === "admin";

                      // ADMIN → click any booked slot
                      if (isAdmin) {
                        onBookedCellClick({
                          type: "admin",
                          slot: slotData
                        });
                        return;
                      }

                      // CLIENT → only his section slots clickable
                      if (s1.bookedBy === myId) {
                        onBookedCellClick({
                          type: "client",
                          slot: slotData,
                          section: "section1"
                        });
                        return;
                      }

                      if (s2.bookedBy === myId) {
                        onBookedCellClick({
                          type: "client",
                          slot: slotData,
                          section: "section2"
                        });
                        return;
                      }

                      return; // other users can't click
                    }

                    if (!bookedSlots.length && !pastSlot) {
                      onEmptyCellClick({
                        date: day.format('YYYY-MM-DD'),
                        startTime: slot,
                      });
                    }
                  }}
                  sx={{
                    height: 40,
                    border: '1px solid #ccc',
                    backgroundColor: bookedSlots.length
                      ? bookedSlots.some(s => s.unavailable)
                        ? '#cccccc'
                        : '#fde613'
                      : pastSlot
                        ? '#e0e0e0'
                        : isDisabledSlot
                          ? '#f5f5f5'
                          : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    cursor: isDisabledSlot
                      ? 'not-allowed'
                      : bookedSlots.length
                        ? 'pointer'
                        : pastSlot
                          ? 'not-allowed'
                          : 'pointer',
                    color: isDisabledSlot
                      ? '#aaa'
                      : bookedSlots.length
                        ? '#000'
                        : pastSlot
                          ? '#999'
                          : '#000',
                    flexDirection: 'column',
                    '&:hover': {
                      backgroundColor: !isDisabledSlot && !bookedSlots.length && !pastSlot ? '#e3f2fd' : undefined,
                    },
                  }}
                >
                  {bookedSlots.length > 0 && (() => {
                    // Check if slot is unavailable
                    if (bookedSlots.some(s => s.unavailable)) {
                      return <Typography fontSize={11} noWrap>Unavailable</Typography>;
                    }

                    // Otherwise, show booked names
                    const nameSet = new Set();
                    bookedSlots.forEach(slotItem => {
                      const s1 = slotItem.sections?.section1?.bookedBy;
                      const s2 = slotItem.sections?.section2?.bookedBy;

                      if (s1) nameSet.add(s1 === "Admin" ? "Admin" : users[s1]?.businessName || "User");
                      if (s2) nameSet.add(s2 === "Admin" ? "Admin" : users[s2]?.businessName || "User");
                    });

                    const names = Array.from(nameSet).join("/");
                    return <Typography fontSize={11} noWrap>{names}</Typography>;
                  })()}
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
