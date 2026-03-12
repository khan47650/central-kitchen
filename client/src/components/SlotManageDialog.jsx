import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  CircularProgress
} from "@mui/material";
import uiColors from "../Styles/uiColors";

const SlotManageDialog = ({
  open,
  onClose,
  user,
  slotToDelete,
  users,
  loadingAction,
  errorMsg,
  deleteSection,
  deleteFullSlot
}) => {

  const isUnavailableSlot = slotToDelete?.slot?.unavailable === true;

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <DialogTitle sx={{ fontWeight: "bold", color: uiColors.text.primary }}>
        Manage Slot
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {errorMsg && (
          <Box sx={{
            bgcolor: "rgba(255,0,0,0.1)",
            border: "1px solid #ff4d4f",
            color: "#ff4d4f",
            p: 1,
            borderRadius: 1,
            mb: 2
          }}>
            {errorMsg}
          </Box>
        )}

        {user.role === "admin" && isUnavailableSlot && (
          <Box mb={2}>
            <Typography fontWeight="bold" mb={2} color="error">
              This slot is Unavailable
            </Typography>

            <Button
              fullWidth
              color="error"
              variant="contained"
              disabled={loadingAction === "full"}
              onClick={deleteFullSlot}
              sx={{ height: 45 }}
            >
              {loadingAction === "full"
                ? <CircularProgress size={22} sx={{ color: "#fff" }} />
                : "Delete Unavailable Slot"}
            </Button>
          </Box>
        )}

        {/* ADMIN NORMAL SLOT */}
        {user.role === "admin" && !isUnavailableSlot && slotToDelete?.slot?.sections && (
          <>
            {/* SECTION 1 */}
            <Box sx={{ ...cardStyle, bgcolor: uiColors.input }}>
              <Box>
                <Typography fontWeight="bold" sx={{ color: "#fff" }}>Section 1</Typography>
                <Typography fontSize={13} sx={{ color: "#ddd" }}>
                  {slotToDelete.slot.sections.section1?.bookedBy
                    ? users[slotToDelete.slot.sections.section1.bookedBy]?.businessName || "Admin"
                    : "Empty"}
                </Typography>
              </Box>
              <Button
                size="small"
                disabled={loadingAction === "section1"}
                onClick={() => deleteSection("section1")}
                sx={{color:uiColors.text.primary}}
              >
                {loadingAction === "section1" ? <CircularProgress size={18} sx={{color:uiColors.text.primary}} /> : "Clear"}
              </Button>
            </Box>

            {/* SECTION 2 */}
            <Box sx={{ ...cardStyle, bgcolor: uiColors.input }}>
              <Box>
                <Typography fontWeight="bold" sx={{ color: "#fff" }}>Section 2</Typography>
                <Typography fontSize={13} sx={{ color: "#ddd" }}>
                  {slotToDelete.slot.sections.section2?.bookedBy
                    ? users[slotToDelete.slot.sections.section2.bookedBy]?.businessName || "Admin"
                    : "Empty"}
                </Typography>
              </Box>
              <Button
                size="small"
                disabled={loadingAction === "section2"}
                onClick={() => deleteSection("section2")}
               sx={{color:uiColors.text.primary}}
              >
                {loadingAction === "section2" ? <CircularProgress size={18} sx={{color:uiColors.text.primary}} /> : "Clear"}
              </Button>
            </Box>

            {/* DELETE FULL SLOT */}
            <Button
              fullWidth
              color="error"
              variant="contained"
              disabled={loadingAction === "full"}
              onClick={deleteFullSlot}
              sx={{
                height: 45, mt: 1, background: uiColors.gradient,
                "&:hover": {
                  background: uiColors.gradientHover,
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
                }
              }}
            >
              {loadingAction === "full"
                ? <CircularProgress size={22} sx={{ color: "#fff" }} />
                : "Delete Full Slot"}
            </Button>
          </>
        )}

        {/* CLIENT MESSAGE */}
        {user.role !== "admin" && (
          <Typography fontWeight="bold">
            Are you sure you want to remove your booking?
          </Typography>
        )}
      </DialogContent>

      {/* FOOTER */}
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: "#fff", borderColor: "#fff" }} >Cancel</Button>

        {user.role !== "admin" && (
          <Button
            disabled={loadingAction === "client"}
            sx={{
              background: uiColors.gradient,
              color:uiColors.text.primary,
              "&:hover": {
                background: uiColors.gradientHover,
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
              }
            }}
            onClick={() => deleteSection(slotToDelete.section)}
          >
            {loadingAction === "client"
              ? <CircularProgress size={18} sx={{ color: "#fff" }} />
              : "Remove"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const cardStyle = {
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 2,
  p: 2,
  mb: 1.5,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

export default SlotManageDialog;