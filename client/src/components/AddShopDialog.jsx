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
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AddAPhoto, Store, LocationOn, Image as ImageIcon } from '@mui/icons-material';
import { Description } from '@mui/icons-material';

const AddShopDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [image, setImage] = useState(null);
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth={isTablet ? 'sm' : 'xs'}
      fullWidth
    >
      <DialogTitle
        textAlign="center"
        sx={{ fontSize: isMobile ? 18 : 20, fontWeight: 600 }}
      >
        Add Shop
      </DialogTitle>

      <DialogContent
        sx={{
          px: isMobile ? 2 : 4,
          pb: isMobile ? 3 : 4
        }}
      >
        <Stack spacing={isMobile ? 2 : 3} alignItems="center">

          {/* Image Section */}
          <Box position="relative">
            <Avatar
              src={image}
              sx={{
                width: isMobile ? 90 : 120,
                height: isMobile ? 90 : 120,
                bgcolor: '#f5f5f5'
              }}
            >
              {!image && (
                <ImageIcon
                  sx={{
                    fontSize: isMobile ? 32 : 40,
                    color: 'grey.500'
                  }}
                />
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

          <TextField
            fullWidth
            size={isMobile ? 'small' : 'medium'}
            label="Shop Name"
            placeholder="Enter shop name"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            InputProps={{
              startAdornment: (
                <Store sx={{ mr: 1, color: 'text.secondary' }} />
              )
            }}
          />
      
          <TextField
            fullWidth
            size={isMobile ? 'small' : 'medium'}
            label="Description"
            placeholder="Enter shop description"
            value={description}  
            onChange={(e) => setDescription(e.target.value)}
            rows={isMobile ? 2 : 4}
            InputProps={{
              startAdornment: (
                <Description  sx={{ mr: 1, color: 'text.secondary' }} />
              )
            }}
          />

          <TextField
            fullWidth
            size={isMobile ? 'small' : 'medium'}
            label="Address"
            placeholder="Enter shop address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={isMobile ? 2 : 3}
            InputProps={{
              startAdornment: (
                <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              )
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
              color: "#fff"
            }}
            onClick={onClose}
          >
            Save
          </Button>

        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default AddShopDialog;
