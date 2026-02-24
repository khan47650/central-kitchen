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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
        Manage Slot
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>

        {errorMsg && (
          <Box sx={{
            bgcolor: "#ffeaea",
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
          <Box>
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
                ? <CircularProgress size={22} sx={{ color: "white" }} />
                : "Delete Unavailable Slot"}
            </Button>
          </Box>
        )}

        {/* ADMIN NORMAL SLOT */}
        {user.role === "admin" && !isUnavailableSlot && slotToDelete?.slot?.sections && (
          <>
            {/* SECTION 1 */}
            <Box sx={cardStyle}>
              <Box>
                <Typography fontWeight="bold">Section 1</Typography>
                <Typography fontSize={13} color="text.secondary">
                  {slotToDelete.slot.sections.section1?.bookedBy
                    ? users[slotToDelete.slot.sections.section1.bookedBy]?.businessName || "Admin"
                    : "Empty"}
                </Typography>
              </Box>
              <Button
                size="small"
                color="warning"
                variant="outlined"
                disabled={loadingAction === "section1"}
                onClick={() => deleteSection("section1")}
              >
                {loadingAction === "section1" ? <CircularProgress size={18} /> : "Clear"}
              </Button>
            </Box>

            {/* SECTION 2 */}
            <Box sx={cardStyle}>
              <Box>
                <Typography fontWeight="bold">Section 2</Typography>
                <Typography fontSize={13} color="text.secondary">
                  {slotToDelete.slot.sections.section2?.bookedBy
                    ? users[slotToDelete.slot.sections.section2.bookedBy]?.businessName || "Admin"
                    : "Empty"}
                </Typography>
              </Box>
              <Button
                size="small"
                color="warning"
                variant="outlined"
                disabled={loadingAction === "section2"}
                onClick={() => deleteSection("section2")}
              >
                {loadingAction === "section2" ? <CircularProgress size={18} /> : "Clear"}
              </Button>
            </Box>

            {/* DELETE FULL SLOT */}
            <Button
              fullWidth
              color="error"
              variant="contained"
              disabled={loadingAction === "full"}
              onClick={deleteFullSlot}
              sx={{ height: 45 }}
            >
              {loadingAction === "full"
                ? <CircularProgress size={22} sx={{ color: "white" }} />
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
        <Button onClick={onClose}>Cancel</Button>

        {user.role !== "admin" && (
          <Button
            color="error"
            variant="contained"
            disabled={loadingAction === "client"}
            onClick={() => deleteSection(slotToDelete.section)}
          >
            {loadingAction === "client"
              ? <CircularProgress size={18} sx={{ color: "white" }} />
              : "Remove"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: 2,
  p: 2,
  mb: 1.5,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

export default SlotManageDialog;