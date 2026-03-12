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
  useMediaQuery,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import axios from 'axios';
import { useAuth } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import uiColors from "../Styles/uiColors";

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const AddCategoryDialog = ({ open, handleClose, handleCreate, ownerId }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const finalUserId = ownerId || user?._id;



  const handleSubmit = async () => {
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    setLoading(true);
    try {
      const newCategory = await handleCreateCategory({ name, description });
      handleCreate(newCategory);
      setName("");
      setDescription("");
      handleClose();
    } catch (err) {
      console.error("Add Category error", err);
      toast.error(
        err?.response?.data?.message || "Failed to create category"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async ({ name, description }) => {
    const res = await axios.post(
      `${DEFAULT_API}/api/categories/add/${finalUserId}`,
      { categoryName: name, categoryDescription: description || "" },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data.category;
  };


  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          p: isMobile ? 2 : 3,
          borderRadius: 2,
          bgcolor: uiColors.card, // dialog background
        },
      }}
    >

      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pr: 0 }}>
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" sx={{ color: uiColors.text.primary }}>
          New Category
        </Typography>
        <IconButton onClick={handleClose}>
          <Close sx={{ color: uiColors.text.primary }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        <TextField
          fullWidth
          placeholder="Enter Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{
            mb: 2,
            bgcolor: uiColors.inputBg,
            "& .MuiInputBase-input": { color: "#fff" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.6)" }
          }}
        />
        <TextField
          fullWidth
          placeholder="Enter Description"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{
            mb: 3,
            bgcolor: uiColors.inputBg,
            "& .MuiInputBase-input": { color: "#fff" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.6)" }
          }}
        />


        <Box display="flex" justifyContent="flex-end">
          <Button variant="contained"
            onClick={handleSubmit}
            fullWidth
            sx={{
              color: "#fff",
              background: uiColors.gradient,
              "&:hover": {
                background: uiColors.gradientHover,
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
              }
            }} 
          disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </Button>
      </Box>
      <ToastContainer autoClose={2000} />
    </DialogContent>
    </Dialog >
  );
};

export default AddCategoryDialog;
