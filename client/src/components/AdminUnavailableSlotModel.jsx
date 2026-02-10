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

const workingHours = [];
for (let hour = 6; hour <= 20; hour++) {
  workingHours.push(`${hour}:00`);
  if (hour < 20) workingHours.push(`${hour}:30`);
}

const formatTime12Hour = (time24) => {
  const [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
};

const AdminUnavailableSlotModal = ({ open, onClose, onBooked }) => {
  const today = moment.tz(AZ_TIMEZONE);
  const [startDate, setStartDate] = useState(today.format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!startTime) {
      setEndTime("");
      return;
    }

    const [hourStr, minuteStr] = startTime.split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);

    const startMoment = moment.tz(`${startDate} ${hour}:${minute}`, 'YYYY-MM-DD H:mm', AZ_TIMEZONE);
    const endMoment = startMoment.clone().add(duration, 'hours'); // hours + exact minutes preserved

    setEndTime(endMoment.format('h:mm A')); // 12-hour format with minutes
  }, [startTime, duration, startDate]);

  const getAvailableTimes = () => {
    return workingHours.map(time => ({ time, disabled: false }));
  };

  const handleSubmit = async () => {
    if (!startTime) {
      setError('Start time select karo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Slot create karna
      const res = await axios.post(`${DEFAULT_API}/api/slots/create`, {
        date: startDate,
        startTime,
        duration,
        makeUnavailable: true

      });

      const bookRes = await axios.post(`${DEFAULT_API}/api/slots/book`, {
        slotId: res.data.slot._id,
        userId: null,
        isAdmin: true,
        duration,
        makeUnavailable: true
      });

      onBooked(bookRes.data.slot);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to make unavailable slot');
    } finally {
      setLoading(false);
    }
  };

  // Duration options based on selected startTime
  const getDurationOptions = () => {
    if (!startTime) return [];

    const [hourStr, minuteStr] = startTime.split(':');
    let hour = parseInt(hourStr);
    let minute = parseInt(minuteStr);

    // End of working hours: 20:00
    const endOfDay = moment.tz(`${startDate} 20:00`, 'YYYY-MM-DD HH:mm', AZ_TIMEZONE);
    const startMoment = moment.tz(`${startDate} ${hour}:${minute}`, 'YYYY-MM-DD H:mm', AZ_TIMEZONE);

    const maxDuration = Math.ceil(moment.duration(endOfDay.diff(startMoment)).asHours());

    // minimum 1 hour, max maxDuration
    const options = [];
    for (let d = 1; d <= maxDuration; d++) {
      options.push(d);
    }
    return options;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Make Slot Unavailable</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Date"
            type="date"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setError(''); }}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Start Time"
            select
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>Select a time</MenuItem>
            {getAvailableTimes().map(({ time }) => (
              <MenuItem key={time} value={time}>
                {formatTime12Hour(time)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Duration (hours)"
            select
            value={duration}
            onChange={e => setDuration(parseInt(e.target.value))}
            fullWidth
          >
            {getDurationOptions().map(d => (
              <MenuItem key={d} value={d}>
                {d} hour{d > 1 ? 's' : ''}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="End Time"
            value={endTime}
            InputProps={{ readOnly: true }}
            fullWidth
          />

          {error && <Typography color="error">{error}</Typography>}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleSubmit} variant="contained" color="error" disabled={loading}>
          {loading ? "Creating..." : "MAKE UNAVAILABLE"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminUnavailableSlotModal;
