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
const durations = [0.5, 1, 1.5, 2, 2.5, 3];

// 24-hour format for logic
const workingHours = [];
for (let hour = 6; hour < 22; hour++) {
  workingHours.push(`${hour}:00`);
  if (hour < 22) {
    workingHours.push(`${hour}:30`);
  }
}

// 12-hour AM/PM conversion
const formatTime12Hour = (time24) => {
  const [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // convert 0 to 12
  return `${hour}:${minute} ${ampm}`;
};

const BookSlotModal = ({ open, onClose, userId, isAdmin, onBooked, slots, selectedSlot }) => {
  const [loading, setLoading] = useState(false);
  const today = moment.tz(AZ_TIMEZONE);
  const startOfWeek = moment.tz(AZ_TIMEZONE).startOf('isoWeek'); // Monday 00:00
  const endOfWeek = moment.tz(AZ_TIMEZONE).endOf('isoWeek');     // Sunday 23:59:59

  const [startDate, setStartDate] = useState(today.format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [section, setSection] = useState("section1");

  useEffect(() => {
    if (selectedSlot && open) {
      setStartDate(selectedSlot.date);
      setStartTime(selectedSlot.startTime);
    }
  }, [selectedSlot, open]);

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

    setEndTime(endMoment.format('h:mm A')); // 12-hour format with minutes
  }, [startTime, duration, startDate]);

  const isValidBookingDay = (dateStr) => {
    const date = moment.tz(dateStr, 'YYYY-MM-DD', AZ_TIMEZONE);
    return date.isBetween(startOfWeek, endOfWeek, 'day', '[]');
  };

  const getAvailableTimes = () => {
    if (!isValidBookingDay(startDate)) {
      return workingHours.map(time => ({
        time,
        disabled: true
      }));
    }

    const now = moment.tz(AZ_TIMEZONE);

    const unavailableSlots = slots.filter(s =>
      s.date === startDate && s.unavailable
    );

    return workingHours.map(time => {
      const slotMoment = moment.tz(`${startDate} ${time}`, 'YYYY-MM-DD HH:mm', AZ_TIMEZONE);

      const isOverlappingUnavailable = unavailableSlots.some(s => {
        const start = moment.tz(`${s.date} ${s.startTime}`, 'YYYY-MM-DD HH:mm', AZ_TIMEZONE);
        const end = moment.tz(`${s.date} ${s.endTime}`, 'YYYY-MM-DD HH:mm', AZ_TIMEZONE);
        return slotMoment.isSameOrAfter(start) && slotMoment.isBefore(end);
      });

      return {
        time,
        disabled: slotMoment.isBefore(now) || isOverlappingUnavailable
      };
    });
  };

  const getAvailableDurations = () => {
    if (!startTime) return durations.map(d => ({ d, disabled: true }));

    const [h, m] = startTime.split(":").map(Number);
    const startMoment = moment.tz(`${startDate} ${h}:${m}`, 'YYYY-MM-DD H:mm', AZ_TIMEZONE);
    const closingMoment = moment.tz(`${startDate} 22:00`, 'YYYY-MM-DD HH:mm', AZ_TIMEZONE);

    return durations.map(d => {
      const endMoment = startMoment.clone().add(d * 60, 'minutes');
      return {
        d,
        disabled: endMoment.isAfter(closingMoment)
      };
    });
  };

  const handleSubmit = async () => {
    if (!isValidBookingDay(startDate)) {
      setError('Bookings are only allowed Monday–Sunday of this week.');
      return;
    }

    setLoading(true);

    try {
      const bookRes = await axios.post(`${DEFAULT_API}/api/slots/book`, {
        date: startDate,
        startTime,
        duration,
        userId,
        isAdmin,
        section
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
        Book a Slot
      </DialogTitle>
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
            sx={{
              bgcolor: uiColors.inputBg,
              input: { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#fff" },
              "& .MuiFormHelperText-root": { color: "#ff4d4f" },
              "& .MuiSvgIcon-root": { color: "#fff" }, // calendar icon
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" }
            }}
            error={!!error}
            helperText={error}
          />

          <TextField
            select
            label="Book Section"
            value={section}
            onChange={e => setSection(e.target.value)}
            fullWidth
            sx={{
              bgcolor:uiColors.inputBg,
              "& .MuiInputBase-root": { color: "#fff" }, // selected value
              "& .MuiInputLabel-root": { color: "#fff" }, // label
              "& .MuiSvgIcon-root": { color: "#fff" }, // dropdown arrow
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" }
            }}
          >
            <MenuItem value="section1">Section 1</MenuItem>
            <MenuItem value="section2">Section 2</MenuItem>
          </TextField>

          <TextField
            label="Start Time"
            select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
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
            {getAvailableTimes().map(({ time, disabled }) => (
              <MenuItem key={time} value={time} disabled={disabled}>
                {formatTime12Hour(time)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Duration"
            select
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
            fullWidth
            sx={{
              bgcolor: uiColors.inputBg,
              "& .MuiInputBase-root": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#fff" },
              "& .MuiSvgIcon-root": { color: "#fff" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" }
            }}
          >
            {getAvailableDurations().map(({ d, disabled }) => (
              <MenuItem key={d} value={d} disabled={disabled}>
                {d === 0.5 ? "30 minutes" : `${d} hours`}
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
              "& .MuiSvgIcon-root": { color: "#fff" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" }
            }}
          />

          <Typography variant="body2" sx={{ color: "#ccc" }}>
            Bookings allowed only in Working hours: 6:00 AM – 10:00 PM.
          </Typography>
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
          {loading ? "Booking Slot..." : "BOOK SLOT"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookSlotModal;