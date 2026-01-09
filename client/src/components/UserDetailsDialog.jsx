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
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";

const UserDetailsDialog = ({ open, onClose, user }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  if (!user) return null;

  const address = user.address || {};
  const phone = user.phone || {};

  const InfoRow = ({ icon, label, value }) => (
    <Grid item xs={12}>
      <Box display="flex" gap={2} alignItems="flex-start">
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
      {/* Header */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              User Details
            </Typography>
        
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>

          <InfoRow
            icon={<PersonIcon fontSize="small" />}
            label="Full Name"
            value={user.fullName}
          />

          <InfoRow
            icon={<BusinessIcon fontSize="small" />}
            label="Business Name"
            value={user.businessName}
          />

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <InfoRow
            icon={<LocationOnIcon fontSize="small" />}
            label="Address"
            value={`${address.street || ""}${address.city ? ", " + address.city : ""}${address.state ? ", " + address.state : ""}`}
          />

          <InfoRow
            icon={<PhoneAndroidIcon fontSize="small" />}
            label="Mobile Number"
            value={phone.mobile}
          />

        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ minWidth: 120 ,color:"white"}}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailsDialog;
