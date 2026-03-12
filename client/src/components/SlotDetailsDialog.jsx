import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Grid,
  Box,
  Avatar,
  useTheme,
  useMediaQuery
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import InfoIcon from '@mui/icons-material/Info';
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import uiColors from "../Styles/uiColors";

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
          <Typography variant="caption" sx={{ color: "#bbb" }}>
            {label}
          </Typography>
          <Typography variant="body1" fontWeight={500} sx={{ color: "#fff" }}>
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
      PaperProps={{
        sx: {
          bgcolor: uiColors.card, 
          color: "#fff",          
          borderRadius: 2         
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: "primary.main", color: "#fff" }}>
            <InfoIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ color: "#fff" }}>
              Slot Details
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ color: "#fff" }}>
        <Grid container spacing={2}>
          <InfoRow
            icon={<PersonIcon fontSize="small" />}
            label="Booked By"
            value={slot.userName || "Not booked"}
          />
          <InfoRow
            icon={<CalendarTodayIcon fontSize="small" />}
            label="Booked On"
            value={slot.bookedOn || slot.date || "-"}
          />
          <InfoRow
            icon={<ScheduleIcon fontSize="small" />}
            label="Start Time"
            value={slot.bookingStart || slot.startTime || "-"}
          />
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
          sx={{
            minWidth: 120,
            color: "#fff",
            background: uiColors.gradient,
            "&:hover": {
              background: uiColors.gradientHover,
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SlotDetailsDialog;