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
    useMediaQuery,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const AdminUpdates = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate=useNavigate();

    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
       navigate(-1);
    };




    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleSendEmail = async () => {
        if (!subject || !description) {
            toast.error("Subject or Description is missing");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("subject", subject);
            formData.append("description", description);

            files.forEach((file) => {
                formData.append("files", file);
            });

            await axios.post(
                `${DEFAULT_API}/api/users/send-announcement`,
                formData
            );

            toast.success("Announcement sent successfully!");
            setSubject("");
            setDescription("");
            setFiles([]);
        } catch (err) {
            toast.error("Failed to send email");
            console.error(err);
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
                    {/* Subject */}
                    <TextField
                        fullWidth
                        placeholder="Subject"
                        variant="outlined"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
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

                    {/* File upload */}
                    <Button
                        variant="outlined"
                        component="label"
                        sx={{ mb: 3, textTransform: "none" }}
                        fullWidth
                    >
                        Upload File
                        <input
                            type="file"
                            hidden
                            multiple
                            onChange={handleFileChange}
                        />
                    </Button>
                    {files.length > 0 && (
                        <Box mb={2}>
                            {files.map((file, index) => (
                                <Typography key={index} variant="body2">
                                    {file.name}
                                </Typography>
                            ))}
                        </Box>
                    )}

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSendEmail}
                        disabled={loading}
                        sx={{ color: "white" }}
                    >
                        {loading ? "Sending..." : "Send Email"}
                    </Button>
                </CardContent>
            </Card>

            <ToastContainer autoClose={2000} />
        </Box>
    );
};

export default AdminUpdates;
