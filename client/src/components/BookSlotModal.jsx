import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Typography,
  Box
} from '@mui/material';
import moment from 'moment-timezone';
import axios from 'axios';

const AZ_TIMEZONE = 'America/Phoenix';
const DEFAULT_API = process.env.REACT_APP_API_URL || "";
const durations = [1, 2, 3];

// 24-hour format for logic
const workingHours = [];
for (let hour = 6; hour <= 20; hour++) {
  workingHours.push(`${hour}:00`);
}

// 12-hour AM/PM conversion
const formatTime12Hour = (time24) => {
  const [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // convert 0 to 12
  return `${hour}:${minute} ${ampm}`;
};

const BookSlotModal = ({ open, onClose, userId, isAdmin, onBooked }) => {
  const [loading,setLoading]=useState(false);
  const today = moment.tz(AZ_TIMEZONE);
  const startOfWeek = moment.tz(AZ_TIMEZONE).startOf('week').add(1, 'day'); // Monday
  const endOfWeek = moment.tz(AZ_TIMEZONE).startOf('week').add(4, 'day');   // Thursday

  const [startDate, setStartDate] = useState(today.format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!startTime) {
      setEndTime("");
      return;
    }
    const [hour] = startTime.split(':');
    const endHour = parseInt(hour) + duration;
    setEndTime(formatTime12Hour(`${endHour}:00`)); // <-- display as 12-hour
  }, [startTime, duration]);

  const isValidBookingDay = (dateStr) => {
    const date = moment.tz(dateStr, 'YYYY-MM-DD', AZ_TIMEZONE);
    const day = date.day();
    return date.isBetween(startOfWeek, endOfWeek, 'day', '[]') && day >= 1 && day <= 4;
  };

  const getAvailableTimes = () => {
    if (!isValidBookingDay(startDate)) {
      return workingHours.map(time => ({
        time,
        disabled: true
      }));
    }

    const now = moment.tz(AZ_TIMEZONE);

    return workingHours.map(time => {
      const slotTime = moment.tz(
        `${startDate} ${time}`,
        'YYYY-MM-DD HH:mm',
        AZ_TIMEZONE
      );
      return {
        time,
        disabled: slotTime.isBefore(now)
      };
    });
  };

  const handleSubmit = async () => {
    if (!isValidBookingDay(startDate)) {
      setError('Bookings are only allowed Monday–Thursday of this week.');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${DEFAULT_API}/api/slots/create`, {
        date: startDate,
        startTime, // still 24-hour for backend
        duration
      });

      const bookRes = await axios.post(`${DEFAULT_API}/api/slots/book`, {
        slotId: res.data.slot._id,
        userId,
        isAdmin,
        duration
      });

      onBooked(bookRes.data.slot);
      setError('');
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Booking failed');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Book a Slot</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Booking Date"
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setError(''); }}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: startOfWeek.format('YYYY-MM-DD'),
              max: endOfWeek.format('YYYY-MM-DD')
            }}
            fullWidth
            error={!!error}
            helperText={error}
          />

          <TextField
            label="Start Time"
            select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>Select a time</MenuItem>
            {getAvailableTimes().map(({ time, disabled }) => (
              <MenuItem key={time} value={time} disabled={disabled}>
                {formatTime12Hour(time)} {/* <-- display in 12-hour */}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Duration (hours)"
            select
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            fullWidth
          >
            {durations.map((d) => (
              <MenuItem key={d} value={d}>
                {d} hour{d > 1 ? 's' : ''}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="End Time"
            value={endTime} // <-- already converted to 12-hour
            InputProps={{ readOnly: true }}
            fullWidth
          />

          <Typography variant="body2" color="textSecondary">
            Bookings allowed Monday–Thursday of this week only. Working hours: 6:00 AM – 8:00 PM.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} variant="contained" color="warning" disabled={loading}>
          {loading? "Booking Slot...":"BOOK SLOT"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookSlotModal;
