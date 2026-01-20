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

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const AddCategoryDialog = ({ open, handleClose, handleCreate }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));



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
      `${DEFAULT_API}/api/categories/add/${user._id}`,
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
        },
      }}
    >

      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pr: 0 }}>
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
          New Category
        </Typography>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        <TextField
          fullWidth
          placeholder="Enter Category Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          placeholder="Enter Description"
          variant="outlined"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 3 }}
        />


        <Box display="flex" justifyContent="flex-end">
          <Button variant="contained"
            onClick={handleSubmit}
            fullWidth
            sx={{ color: "white" }}
            disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </Box>
        <ToastContainer autoClose={2000} />
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
