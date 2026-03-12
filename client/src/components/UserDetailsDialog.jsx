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
  useMediaQuery,
  Paper
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LanguageIcon from "@mui/icons-material/Language";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import CommentIcon from "@mui/icons-material/Comment";
import uiColors from "../Styles/uiColors";

const UserDetailsDialog = ({ open, onClose, user }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  if (!user) return null;

  const address = user.address || {};
  const phone = user.phone || {};

  const InfoRow = ({ icon, label, value }) => {
    if (!value) return null;

    return (
      <Grid item xs={12} md={6}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            display: "flex",
            gap: 2,
            alignItems: "center",
            borderRadius: 2,
            bgcolor: uiColors.background,
            border: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.light", // keep icon background unchanged
              width: 36,
              height: 36,
              color: "#fff"
            }}
          >
            {icon}
          </Avatar>

          <Box>
            <Typography variant="caption" sx={{ color: "#bbb" }}>
              {label}
            </Typography>
            <Typography variant="body1" fontWeight={500} sx={{ color: "#fff" }}>
              {value}
            </Typography>
          </Box>
        </Paper>
      </Grid>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: uiColors.card,
          color: "#fff",
          borderRadius: 2
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ bgcolor: uiColors.card }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: "primary.light", color: "#fff" }}>
            <PersonIcon />
          </Avatar>

          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ color: "#fff" }}>
              User Details
            </Typography>
            <Typography variant="body2" sx={{ color: "#bbb" }}>
              {user.email}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <InfoRow icon={<PersonIcon fontSize="small" />} label="Full Name" value={user.fullName} />
          <InfoRow icon={<BusinessIcon fontSize="small" />} label="Business Name" value={user.businessName} />
          <InfoRow icon={<HomeWorkIcon fontSize="small" />} label="Business Type" value={user.typeOfBusiness} />
          <InfoRow icon={<LocationOnIcon fontSize="small" />} label="Preferred Location" value={user.preferredLocation} />
          <InfoRow icon={<PersonIcon fontSize="small" />} label="Contact Title" value={user.contactTitle} />
          <InfoRow icon={<PersonIcon fontSize="small" />} label="Contact Name" value={user.contactName} />

          <Grid item xs={12}>
            <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }} />
          </Grid>

          <InfoRow icon={<HomeWorkIcon fontSize="small" />} label="Property Type" value={address.typeOfProperty} />
          <InfoRow icon={<LocationOnIcon fontSize="small" />} label="Street" value={address.street} />
          <InfoRow icon={<LocationOnIcon fontSize="small" />} label="City" value={address.city} />
          <InfoRow icon={<LocationOnIcon fontSize="small" />} label="State" value={address.state} />
          <InfoRow icon={<LocationOnIcon fontSize="small" />} label="Zip Code" value={address.zipCode} />

          <Grid item xs={12}>
            <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }} />
          </Grid>

          <InfoRow icon={<PhoneAndroidIcon fontSize="small" />} label="Mobile" value={phone.mobile} />
          <InfoRow icon={<PhoneAndroidIcon fontSize="small" />} label="Business Phone" value={phone.business} />
          <InfoRow icon={<PhoneAndroidIcon fontSize="small" />} label="Fax" value={phone.fax} />
          <InfoRow icon={<LanguageIcon fontSize="small" />} label="Website" value={user.website} />
          <InfoRow icon={<CommentIcon fontSize="small" />} label="Comments" value={user.comments} />
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: uiColors.card }}>
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

export default UserDetailsDialog;