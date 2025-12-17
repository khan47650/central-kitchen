import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import moment from 'moment-timezone';

const AZ_TIMEZONE = 'America/Phoenix';


const timeSlots = [
  '6:00','7:00','8:00','9:00',
  '10:00','11:00','12:00','13:00','14:00','15:00','16:00',
  '17:00','18:00','19:00','20:00'
];

const CalendarGrid = ({ selectedWeek, slots, users }) => {
 const startOfWeek = moment.tz(selectedWeek, AZ_TIMEZONE).startOf('week').add(1, 'day'); // Monday

  const days = [0,1,2,3].map(i => moment(startOfWeek).add(i,'days'));
  const now = moment.tz(AZ_TIMEZONE);

  // Find slot that includes this time
const getSlotForCell = (day, slotTime) => {
  const slotMoment = moment.tz(
    `${day.format('YYYY-MM-DD')} ${slotTime}`,
    'YYYY-MM-DD H:mm',
    AZ_TIMEZONE
  );

  return slots.find(s => {
    const start = moment.tz(
      `${s.date} ${s.startTime}`,
      'YYYY-MM-DD H:mm',
      AZ_TIMEZONE
    );
    const end = moment.tz(
      `${s.date} ${s.endTime}`,
      'YYYY-MM-DD H:mm',
      AZ_TIMEZONE
    );

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
    <Grid container spacing={0.2}> 
      {/* Header */}
      <Grid item xs={1}>
        <Box fontWeight="bold" mb={0.5}>Time</Box>
      </Grid>
      {days.map((day, idx) => (
        <Grid item xs={2.75} key={idx}>
          <Box fontWeight="bold" mb={0.5}>{day.format('dddd, MMM D')}</Box>
        </Grid>
      ))}

      {/* Time slots */}
      {timeSlots.map((slot, i) => (
        <React.Fragment key={i}>
          <Grid item xs={1}>
            <Typography sx={{ mb: 0.3 }}>{slot}</Typography>
          </Grid>
          {days.map((day, j) => {
            const bookedSlot = getSlotForCell(day, slot);
            const pastSlot = isPastSlot(day, slot);
            const showName = bookedSlot && slot === bookedSlot.startTime; // name only in start time
            return (
              <Grid item xs={2.75} key={j}>
                <Box
                  sx={{
                    border: '1px solid #ccc',
                    height: 40,
                    backgroundColor: bookedSlot ? '#fde613ff' : pastSlot ? '#e0e0e0' : 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: bookedSlot || pastSlot ? 'not-allowed' : 'pointer',
                    color: pastSlot ? '#999' : 'inherit',
                    mx: 0.2,
                    my: -0.1,
                  }}
                >
                  {showName
                    ? (bookedSlot.bookedBy === 'Admin' ? 'Admin' : users[bookedSlot.bookedBy] || 'User')
                    : '' /* only start time shows name */}
                </Box>
              </Grid>
            );
          })}
        </React.Fragment>
      ))}
    </Grid>
  );
};

export default CalendarGrid;
