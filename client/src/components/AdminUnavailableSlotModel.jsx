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
import uiColors from '../Styles/uiColors';

const AZ_TIMEZONE = 'America/Phoenix';
const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const workingHours = [];
for (let hour = 6; hour <= 22; hour++) {
  workingHours.push(`${hour}:00`);
  if (hour < 22) workingHours.push(`${hour}:30`);
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
    const endMoment = startMoment.clone().add(duration * 60, 'minutes');

    setEndTime(endMoment.format('h:mm A'));

  }, [startTime, duration, startDate]);

  const getAvailableTimes = () => {
    return workingHours.map(time => ({ time }));
  };

  const getDurationOptions = () => {

    if (!startTime) return [];

    const [hourStr, minuteStr] = startTime.split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);

    const startMoment = moment.tz(`${startDate} ${hour}:${minute}`, 'YYYY-MM-DD H:mm', AZ_TIMEZONE);
    const endOfDay = moment.tz(`${startDate} 22:00`, 'YYYY-MM-DD HH:mm', AZ_TIMEZONE);

    const maxMinutes = endOfDay.diff(startMoment, 'minutes');

    const options = [];

    for (let m = 30; m <= maxMinutes; m += 30) {
      options.push(m / 60);
    }

    return options;
  };

  const handleSubmit = async () => {

    if (!startTime) {
      setError('Missing Fields');
      return;
    }

    setLoading(true);

    try {

      const res = await axios.post(`${DEFAULT_API}/api/slots/create`, {
        date: startDate,
        startTime,
        duration,
        makeUnavailable: true,
        sections: {
          section1: null,
          section2: null
        }
      });

      onBooked(res.data.slot);
      setError('');
      onClose();

    } catch (err) {

      console.error(err);
      setError(err.response?.data?.error || 'Failed to make unavailable slot');

    }

    setLoading(false);
  };

  return (

    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: uiColors.card,
          color: "#fff",
          borderRadius: 2
        }
      }}
    >

      <DialogTitle sx={{ color: uiColors.text.primary, fontWeight: "bold" }}>
        Make Slot Unavailable
      </DialogTitle>

      <DialogContent>

        <Box display="flex" flexDirection="column" gap={2} mt={1}>

          <TextField
            label="Date"
            type="date"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setError(''); }}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{
              bgcolor: uiColors.inputBg,
              input: { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#fff" },
              "& .MuiSvgIcon-root": { color: "#fff" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" }
            }}
          />

          <TextField
            label="Start Time"
            select
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            fullWidth
            displayEmpty
            sx={{
              bgcolor: uiColors.inputBg,
              "& .MuiInputBase-root": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#fff" },
              "& .MuiSvgIcon-root": { color: "#fff" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" }
            }}
          >

            <MenuItem value="" disabled>Select a time</MenuItem>

            {getAvailableTimes().map(({ time }) => (
              <MenuItem key={time} value={time}>
                {formatTime12Hour(time)}
              </MenuItem>
            ))}

          </TextField>

          <TextField
            label="Duration"
            select
            value={duration}
            onChange={e => setDuration(parseFloat(e.target.value))}
            fullWidth
            sx={{
              bgcolor: uiColors.inputBg,
              "& .MuiInputBase-root": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#fff" },
              "& .MuiSvgIcon-root": { color: "#fff" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" }
            }}
          >

            {getDurationOptions().map(d => (
              <MenuItem key={d} value={d}>
                {d < 1 ? `${d * 60} minutes` : `${d} hours`}
              </MenuItem>
            ))}

          </TextField>

          <TextField
            label="End Time"
            value={endTime}
            InputProps={{ readOnly: true }}
            fullWidth
            sx={{
              bgcolor: uiColors.inputBg,
              input: { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#fff" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" }
            }}
          />

          {error && <Typography color="error">{error}</Typography>}

        </Box>

      </DialogContent>

      <DialogActions>

        <Button
          onClick={handleSubmit}
          fullWidth
          disabled={loading}
          sx={{
            background: uiColors.gradient,
            color: uiColors.text.primary,
            "&:hover": {
              background: uiColors.gradientHover,
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
            }
          }}
        >
          {loading ? "Creating..." : "MAKE UNAVAILABLE"}
        </Button>

      </DialogActions>

    </Dialog>
  );
};

export default AdminUnavailableSlotModal;