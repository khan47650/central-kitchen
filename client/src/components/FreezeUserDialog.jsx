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
import { Close, Subject } from "@mui/icons-material";
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const FreezUserDialog = ({ open, handleClose, handleFreez, userId }) => {
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const finalUserId = userId;


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
                },
            }}
        >

            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pr: 0 }}>
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
                    Remarks
                </Typography>
                <IconButton onClick={handleDialogClose}>
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
                        mb: 3, '& .MuiInputBase-input': {
                            fontSize: '13px',
                            lineHeight: '1.4',
                            fontWeight: 400,
                            color: '#6B7280'
                        }
                    }}
                />


                <Box display="flex" justifyContent="flex-end">
                    <Button variant="contained"
                        onClick={()=>handleSubmit(finalUserId)}
                        fullWidth
                        sx={{ color: "white" }}
                        disabled={loading}>
                        {loading ? "Sending..." : "Send Email"}
                    </Button>
                </Box>
                <ToastContainer autoClose={2000} />
            </DialogContent>
        </Dialog>
    );
};

export default FreezUserDialog;
