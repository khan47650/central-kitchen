import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Close } from "@mui/icons-material";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import uiColors from "../Styles/uiColors";

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const FreezUserDialog = ({ open, handleClose, handleFreez, userId }) => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleDialogClose = () => {
    setDescription("");
    handleClose();
  };

  const handleSubmit = async (id) => {
    if (!description) {
      toast.error("Remarks are missing");
      return;
    }

    setLoading(true);

    try {
      await axios.put(`${DEFAULT_API}/api/users/freez/${id}`, {
        remarks: description
      });

      handleFreez();
      setDescription("");
      handleClose();

    } catch (err) {

      console.error("Freeze error", err);
      toast.error(
        err?.response?.data?.message || "Failed to freeze user"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          p: isMobile ? 2 : 3,
          borderRadius: 2,
          bgcolor: uiColors.card,
          color: "#fff"
        }
      }}
    >

      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pr: 0,
          color: uiColors.text.primary,
          fontWeight: "bold"
        }}
      >

        <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
          Remarks
        </Typography>

        <IconButton onClick={handleDialogClose} sx={{ color: "#fff" }}>
          <Close />
        </IconButton>

      </DialogTitle>

      <DialogContent sx={{ mt: 1 }}>

        <TextField
          fullWidth
          placeholder="Enter your remarks"
          variant="outlined"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{
            mb: 3,
            bgcolor: uiColors.inputBg,
            "& .MuiInputBase-input": {
              fontSize: "13px",
              lineHeight: "1.4",
              fontWeight: 400,
              color: "#fff"
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#555"
            }
          }}
        />

        <Box display="flex" justifyContent="flex-end">

          <Button
            onClick={() => handleSubmit(userId)}
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
            {loading ? "Sending..." : "Send Email"}
          </Button>

        </Box>

        <ToastContainer autoClose={2000} />

      </DialogContent>

    </Dialog>
  );
};

export default FreezUserDialog;