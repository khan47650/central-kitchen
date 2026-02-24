import React, { useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    IconButton,
    useTheme,
    useMediaQuery
} from "@mui/material";
import { ArrowBack, PhotoCamera } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const AdminUpdates = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
        navigate(-1);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSaveAnnouncement = async () => {
        if (!title || !description) {
            toast.error("Title or Description missing");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            if (image) formData.append("image", image);

            await axios.post(`${DEFAULT_API}/api/users/create-announcement`, formData);

            toast.success("Announcement saved!");
            setTitle("");
            setDescription("");
            setImage(null);
            setPreview(null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to save announcement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={isMobile ? 1 : 2}>
            {/* Top bar */}
            <Box display="flex" alignItems="center" mb={3}>
                <IconButton onClick={handleBack}>
                    <ArrowBack />
                </IconButton>
                <Typography variant={isMobile ? "h6" : "h5"} ml={1}>
                    Announcement
                </Typography>
            </Box>

            {/* Card container */}
            <Card
                sx={{
                    maxWidth: 700,
                    margin: "auto",
                    borderRadius: 3,
                    boxShadow: 3,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: 6,
                    },
                }}
            >
                <CardContent>

                    <Box display="flex" justifyContent="center" mb={2}>
                        <Box position="relative" textAlign="center">

                            {/* Preview Image */}
                            {preview ? (
                                <Box
                                    component="img"
                                    src={preview}
                                    alt="preview"
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: "2px solid #ddd",
                                    }}
                                />
                            ) : (
                                <Box
                                    component="label"
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: "50%",
                                        border: "2px dashed #ccc",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        bgcolor: "#f9fafb",
                                        "&:hover": { bgcolor: "#f3f4f6" },
                                    }}
                                >
                                    <PhotoCamera sx={{ fontSize: 40, color: "#9ca3af" }} />
                                    <input hidden type="file" accept="image/*" onChange={handleImageChange} />
                                </Box>
                            )}

                            {/* Small Edit Icon on Preview */}
                            {preview && (
                                <IconButton
                                    component="label"
                                    sx={{
                                        position: "absolute",
                                        bottom: 5,
                                        right: 5,
                                        bgcolor: "white",
                                        border: "1px solid #ddd",
                                    }}
                                >
                                    <PhotoCamera fontSize="small" />
                                    <input hidden type="file" accept="image/*" onChange={handleImageChange} />
                                </IconButton>
                            )}
                        </Box>
                    </Box>

                    <TextField
                        fullWidth
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{ mb: 3 }}
                    />

                    {/* Description */}
                    <TextField
                        fullWidth
                        placeholder="Description"
                        variant="outlined"
                        multiline
                        rows={4}
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

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSaveAnnouncement}
                        disabled={loading}
                        sx={{ color: "white" }}
                    >
                        {loading ? "Saving..." : "Save Announcement"}
                    </Button>
                </CardContent>
            </Card>

            <ToastContainer autoClose={2000} />
        </Box>
    );
};

export default AdminUpdates;
