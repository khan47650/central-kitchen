import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  IconButton,
  Avatar,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Close, AddAPhoto } from "@mui/icons-material";
import ImageIcon from "@mui/icons-material/Image";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const AddEditItemDialog = ({ open, onClose, itemData, categoryId, onSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [status, setStatus] = useState("IN_STOCK");


  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (itemData) {
      setName(itemData.name || "");
      setPrice(itemData.price || "");
      setDescription(itemData.description || "");
      setImagePreview(itemData.image || "");
      setStatus(itemData.itemStatus || "IN_STOCK");
      setImageFile(null);

    } else {
        resetFields();
    }
  }, [itemData]);

   const resetFields = () => {
    setName("");
    setPrice("");
    setDescription("");
    setImagePreview("");
    setImageFile(null);
    setStatus("IN_STOCK");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async () => {
    if (!name || !price || (!imageFile && !imagePreview)) {
      toast.error("Item name , price & image are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description || "");
    formData.append("itemStatus", status);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      setLoading(true);

      if (itemData) {
        //EDIT ITEM
        await axios.put(
          `${DEFAULT_API}/api/categories/editItem/${categoryId}/${itemData._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Item updated successfully");
      } else {
        //ADD ITEM
        await axios.post(
          `${DEFAULT_API}/api/categories/item/${categoryId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Item added successfully");
      }

      onSuccess();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetFields();
    onClose();
  };


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant={isMobile ? "h6" : "h5"}>
            {itemData ? "Edit Item" : "Add Item"}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" justifyContent="center" mb={3}>
          <Box position="relative">
            <Avatar
              src={imagePreview}
              sx={{
                width: isMobile ? 90 : 120,
                height: isMobile ? 90 : 120,
                bgcolor: "#f5f5f5",
              }}
            >
              {!imagePreview && (
                <ImageIcon
                  sx={{
                    fontSize: isMobile ? 32 : 40,
                    color: "grey.500",
                  }}
                />
              )}
            </Avatar>

            <IconButton
              component="label"
              size={isMobile ? "small" : "medium"}
              sx={{
                position: "absolute",
                bottom: -4,
                right: -4,
                bgcolor: "primary.main",
                color: "#fff",
                boxShadow: 2,
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              <AddAPhoto fontSize="small" />
              <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
            </IconButton>
          </Box>
        </Box>

        <TextField
          fullWidth
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          placeholder="Price ($)"
          type="number"
          value={price}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (val >= 0 || e.target.value === "") {
              setPrice(e.target.value);
            }
          }}
          margin="normal"
        />

        <TextField
          fullWidth
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={3}
        />

        <Button
          variant="contained"
          fullWidth
          disabled={loading}
          onClick={handleSubmit}
          sx={{ py: 1, color: "white",mt:1 }}
        >
          {loading ? "Saving..." : itemData ? "Update" : "Add"}
        </Button>
        <ToastContainer autoClose={2000} />
      </DialogContent>
    </Dialog>
  );
};

export default AddEditItemDialog;
