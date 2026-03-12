import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Avatar,
  IconButton,
  TextField,
  Button,
  Stack,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AddAPhoto, Store, LocationOn, Image as ImageIcon, Description } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from "../context/AuthContext";
import uiColors from "../Styles/uiColors";

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const AddShopDialog = ({ open, onSuccess, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!shopName || !address || !description || !imageFile) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("shopImage", imageFile);
      formData.append("shopName", shopName);
      formData.append("description", description);
      formData.append("address", address);
      formData.append("userId", user?._id);

      await axios.post(`${DEFAULT_API}/api/shops/add/${user._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setLoading(false);
      onClose(true);
      onSuccess?.();

      setShopName('');
      setAddress('');
      setDescription('');
      setImagePreview(null);
      setImageFile(null);

    } catch (error) {
      setLoading(false);
      console.error("Error in adding shop", error);
    }
  };

  const isDisabled =
    loading ||
    !shopName.trim() ||
    !address.trim() ||
    !description.trim() || !imageFile;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth={isTablet ? 'sm' : 'xs'}
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: uiColors.card, // dialog background
          borderRadius: 2,
          p: isMobile ? 2 : 3
        }
      }}
    >
      <DialogTitle
        textAlign="center"
        sx={{
          fontSize: isMobile ? 18 : 20,
          fontWeight: 600,
          color: uiColors.text.primary // heading color
        }}
      >
        Add Shop
      </DialogTitle>

      <DialogContent sx={{ px: isMobile ? 2 : 4, pb: isMobile ? 3 : 4 }}>
        <Stack spacing={isMobile ? 2 : 3} alignItems="center">

          {/* Image Section */}
          <Box position="relative">
            <Avatar
              src={imagePreview}
              sx={{
                width: isMobile ? 90 : 120,
                height: isMobile ? 90 : 120,
                bgcolor: '#f5f5f5'
              }}
            >
              {!imagePreview && (
                <ImageIcon sx={{ fontSize: isMobile ? 32 : 40, color: 'grey.500' }} />
              )}
            </Avatar>

            <IconButton
              component="label"
              size={isMobile ? 'small' : 'medium'}
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                bgcolor: 'primary.main',
                color: '#fff',
                boxShadow: 2,
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <AddAPhoto fontSize="small" />
              <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
            </IconButton>
          </Box>

          {/* Shop Name */}
          <TextField
            fullWidth
            size={isMobile ? 'small' : 'medium'}
            label="Shop Name"
            placeholder="Enter shop name"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            InputProps={{
              startAdornment: <Store sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{
              bgcolor: uiColors.inputBg,
              "& .MuiInputBase-input": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#fff" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.6)" }
            }}
          />

          {/* Description */}
          <TextField
            fullWidth
            size={isMobile ? 'small' : 'medium'}
            label="Description"
            placeholder="Enter shop description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={isMobile ? 2 : 4}
            multiline
            InputProps={{
              startAdornment: <Description sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{
              bgcolor: uiColors.inputBg,
              "& .MuiInputBase-input": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#fff" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.6)" }
            }}
          />

          {/* Address */}
          <TextField
            fullWidth
            size={isMobile ? 'small' : 'medium'}
            label="Address"
            placeholder="Enter shop address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={isMobile ? 2 : 3}
            multiline
            InputProps={{
              startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{
              bgcolor: uiColors.inputBg,
              "& .MuiInputBase-input": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#fff" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.6)" }
            }}
          />

          <Button
            fullWidth
            variant="contained"
            size={isMobile ? 'medium' : 'large'}
            sx={{
              mt: 1,
              py: isMobile ? 1 : 1.2,
              borderRadius: 2,
              color: "#fff",
              background: uiColors.gradient,
              "&:hover": {
                background: uiColors.gradientHover,
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
              }
            }}
            disabled={isDisabled}
            onClick={handleSave}
          >
            {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Save"}
          </Button>

        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default AddShopDialog;