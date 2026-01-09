import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Grid,
  Divider,
  Box,
  Avatar,
  useTheme,
  useMediaQuery
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import InfoIcon from '@mui/icons-material/Info';
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const SlotDetailsDialog = ({ open, onClose, slot }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  if (!slot) return null;

  const InfoRow = ({ icon, label, value }) => (
    <Grid item xs={12}>
      <Box display="flex" gap={2} alignItems="center" mb={1}>
        <Avatar
          sx={{
            bgcolor: "primary.light",
            color: "#fff",
            width: 36,
            height: 36
          }}
        >
          {icon}
        </Avatar>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {value || "-"}
          </Typography>
        </Box>
      </Box>
    </Grid>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <InfoIcon />  
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Slot Details
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Booked By */}
          <InfoRow
            icon={<PersonIcon fontSize="small" />}
            label="Booked By"
            value={slot.userName || "Not booked"}
          />

          {/* Booked On */}
          <InfoRow
            icon={<CalendarTodayIcon fontSize="small" />}
            label="Booked On"
            value={slot.bookedOn || slot.date ||"-"}
          />

          {/* Start Time */}
          <InfoRow
            icon={<ScheduleIcon fontSize="small" />}
            label="Start Time"
            value={slot.bookingStart || slot.startTime || "-"}
          />

          {/* End Time */}
          <InfoRow
            icon={<ScheduleIcon fontSize="small" />}
            label="End Time"
            value={slot.bookingEnd || slot.endTime || "-"}
          />
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ minWidth: 120, color: "white" }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SlotDetailsDialog;
