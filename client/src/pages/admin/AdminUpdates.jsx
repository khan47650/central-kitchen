import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Card,
    CardContent,
    useTheme,
    useMediaQuery
} from "@mui/material";
import { ArrowBack, PhotoCamera, Delete, Edit } from "@mui/icons-material";
import { Skeleton } from "@mui/material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import HoverZoomImage from "../../components/HoverZoomImage";
import uiColors from "../../Styles/uiColors";

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const AdminUpdates = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [announcements, setAnnouncements] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("1 week");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const handleBack = () => navigate(-1);

    const handleOpenDialog = () => setOpen(true);

    const handleCloseDialog = () => {
        setOpen(false);
        setTitle("");
        setDescription("");
        setDuration("1 week");
        setImage(null);
        setPreview(null);
        setEditingId(null);
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await axios.get(`${DEFAULT_API}/api/users/announcements/all`);
            setAnnouncements(res.data.announcements);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch announcements");
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    // Save or update announcement
    const handleSaveAnnouncement = async () => {
        if (!title || !description || !duration) return toast.error("Title,description and duration are required");

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("duration", duration);
            if (image) formData.append("image", image);

            if (editingId) {
                // Edit mode
                await axios.put(`${DEFAULT_API}/api/users/announcement/${editingId}`, formData);
                toast.success("Announcement updated!");
            } else {
                // Create mode
                await axios.post(`${DEFAULT_API}/api/users/create-announcement`, formData);
                toast.success("Announcement saved!");
            }

            handleCloseDialog();
            fetchAnnouncements();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save announcement");
        } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${DEFAULT_API}/api/users/announcement/${id}`);
            toast.success("Deleted successfully");
            fetchAnnouncements();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const handleEdit = (announcement) => {
        setEditingId(announcement._id);
        setTitle(announcement.title);
        setDescription(announcement.description);
        setDuration(announcement.duration);
        setPreview(announcement.image || null);
        setOpen(true);
    };

    return (
        <Box p={isMobile ? 1 : 2}>
            {/* Top bar */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap">
                <Box display="flex" alignItems="center">
                    <IconButton onClick={handleBack}><ArrowBack sx={{ color: uiColors.text.primary }} /></IconButton>
                    <Typography variant={isMobile ? "h6" : "h5"} ml={1} sx={{ color: uiColors.text.primary }} >Announcements</Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={handleOpenDialog}
                    sx={{
                        mt: isMobile ? 1 : 0, width: isMobile ? "100%" : "auto", background: uiColors.gradient,
                        color: "white",
                        "&:hover": {
                            background: uiColors.gradientHover,
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
                        }
                    }}
                >
                    New Announcement
                </Button>
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
                {loadingData ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} sx={{ bgcolor: uiColors.card, color: uiColors.text.primary }}>
                            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Skeleton variant="rectangular" width={60} height={60} sx={{ borderRadius: 1, bgcolor: uiColors.skeleton }} />
                                <Box flex={1}>
                                    <Skeleton width="80%" height={20} sx={{ mb: 1, bgcolor: uiColors.skeleton }} />
                                    <Skeleton width="50%" height={15} sx={{ bgcolor: uiColors.skeleton }} />
                                </Box>
                                <Box display="flex" gap={1}>
                                    <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: uiColors.skeleton }} />
                                    <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: uiColors.skeleton }} />
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                ) : announcements.length === 0 ? (

                    <Box width="100%" textAlign="center" mt={4}>
                        <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ color: uiColors.text.primary }}>
                            No Announcement Found
                        </Typography>
                    </Box>

                ) : (
                    announcements.map((a) => (
                        <Card
                            key={a._id}
                            sx={{
                                bgcolor: uiColors.card,
                                color: uiColors.text.primary,
                                boxShadow: `0 0 10px ${uiColors.cardGlow}`,
                                transition: "all 0.3s",
                                "&:hover": {
                                    boxShadow: `0 0 20px ${uiColors.teal}`,
                                },
                                cursor: "pointer"
                            }}
                        >
                            <CardContent
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    position: "relative",
                                }}
                            >
                                <Box
                                    width={60}
                                    height={60}
                                    borderRadius={1}
                                    bgcolor={a.image ? "transparent" : uiColors.card}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    sx={{
                                        zIndex: 1,
                                    }}
                                >
                                    {a.image ? (
                                        <HoverZoomImage src={a.image} size={60} zoomSize={200} />
                                    ) : (
                                        <PhotoCamera sx={{ fontSize: 30, color: "#9ca3af" }} />
                                    )}
                                </Box>

                                <Box flex={1}>
                                    <Typography>{a.title}</Typography>
                                    <Typography variant="caption">Duration: {a.duration}</Typography>
                                </Box>

                                <Box display="flex" gap={1}>
                                    <IconButton onClick={() => handleEdit(a)} sx={{ color: uiColors.text.primary }}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(a._id)} sx={{ color: "red" }}>
                                        <Delete />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>

            {/* Dialog */}
            <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{
                sx: { bgcolor: uiColors.card, color: uiColors.text.primary }
            }}>
                <DialogTitle sx={{ color: uiColors.text.primary }}>{editingId ? "Edit Announcement" : "New Announcement"}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {/* Dialog Image Selector */}
                    <Box position="relative" textAlign="center" mb={2}>
                        <Box
                            component="label"
                            sx={{
                                width: 120,
                                height: 120,
                                borderRadius: "50%",
                                border: preview ? "2px solid #ddd" : "2px dashed #ccc",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                bgcolor: preview ? "transparent" : "#f9fafb",
                                "&:hover": { bgcolor: preview ? "transparent" : "#f3f4f6" },
                                mb: 1,
                                overflow: "hidden",
                            }}
                        >
                            {preview ? (
                                <Box
                                    component="img"
                                    src={preview}
                                    alt="preview"
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <PhotoCamera sx={{ fontSize: 40, color: "#9ca3af" }} />
                            )}
                            <input
                                hidden
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    setImage(file);
                                    setPreview(URL.createObjectURL(file));
                                }}
                            />
                        </Box>
                    </Box>

                    <TextField
                        fullWidth
                        label="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        sx={{
                            mb: 2,
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: uiColors.inputBg,
                                color: "#fff",
                                "& fieldset": { borderColor: "#6b7280" },
                                "&:hover fieldset": { borderColor: "#9ca3af" },
                                "&.Mui-focused fieldset": { borderColor: "#9ca3af" }
                            },
                            "& .MuiInputLabel-root": { color: "#fff" }
                        }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        sx={{
                            mb: 2,
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: uiColors.inputBg,
                                color: "#fff",
                                "& fieldset": { borderColor: "#6b7280" },
                                "&:hover fieldset": { borderColor: "#9ca3af" },
                                "&.Mui-focused fieldset": { borderColor: "#9ca3af" }
                            },
                            "& .MuiInputLabel-root": { color: "#fff" }
                        }}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Duration"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        sx={{
                            mb: 2,
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: uiColors.inputBg,
                                color: "#fff",
                                "& fieldset": { borderColor: "#6b7280" },
                                "&:hover fieldset": { borderColor: "#9ca3af" },
                                "&.Mui-focused fieldset": { borderColor: "#9ca3af" }
                            },
                            "& .MuiInputLabel-root": { color: "#fff" },
                            "& .MuiSvgIcon-root": { color: "#fff" }
                        }}
                        SelectProps={{
                            MenuProps: {
                                PaperProps: {
                                    sx: {
                                        bgcolor: uiColors.inputBg, // dropdown background
                                        color: "#fff"
                                    }
                                }
                            }
                        }}
                    >
                        <MenuItem value="1 day">1 day</MenuItem>
                        <MenuItem value="1 week">1 week</MenuItem>
                        <MenuItem value="1 month">1 month</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} sx={{ color: uiColors.text.primary }}>Cancel</Button>
                    <Button onClick={handleSaveAnnouncement} disabled={loading} sx={{ color: "white", background: uiColors.gradient, "&:hover": { background: uiColors.gradientHover }, minWidth: 120 }}>
                        {loading ? "Saving..." : editingId ? "Update" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer autoClose={2000} />
        </Box>
    );
};

export default AdminUpdates;