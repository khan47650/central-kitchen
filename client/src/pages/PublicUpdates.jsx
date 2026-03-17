import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Autocomplete,
  Chip,
  Paper,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { getPublicUser, setPublicUser, clearPublicUser } from "../utils/publicUser";
import logo from "../assets/img/new_logo_white.png";
import { useNavigate } from "react-router-dom";
import uiColors from "../Styles/uiColors";

export default function PublicUpdates() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getPublicUser());
  const [shops, setShops] = useState([]);
  const [selectedShops, setSelectedShops] = useState([]);
  const [dirty, setDirty] = useState(false);

  // Separate loading states
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingUnregister, setLoadingUnregister] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "";
  const api = axios.create({ baseURL: API_URL });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    address: "",
  });

  const updateField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ---------------- LOAD SHOPS ----------------
  useEffect(() => {
    api
      .get("/api/publicUser/shops")
      .then((res) => setShops(res.data))
      .catch(() => toast.error("Failed to load shops"));
  }, []);

  // ---------------- LOAD SAVED SHOPS ----------------
  useEffect(() => {
    if (user?.subscribedShops) {
      setSelectedShops(user.subscribedShops);
    }
  }, [user]);

  // ---------------- VALIDATE REGISTER ----------------
  const validateRegister = () => {
    for (let key in form) {
      if (!form[key]?.trim()) {
        toast.error(`Please fill ${key}`);
        return false;
      }
    }
    return true;
  };

  // ---------------- REGISTER ----------------
  const register = async () => {
    if (!validateRegister()) return;
    setLoadingRegister(true);
    try {
      const res = await api.post("/api/publicUser/register", form);
      setUser(res.data);
      setPublicUser(res.data);
      toast.success("Registered successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Register failed");
    } finally {
      setLoadingRegister(false);
    }
  };

  // ---------------- SAVE SUBSCRIPTIONS ----------------
  const save = async () => {
    setLoadingSave(true);
    try {
      // Backend handles empty array as "remove all subscriptions"
      await api.post("/api/publicUser/subscribe", {
        userId: user._id,
        shopIds: selectedShops.map((s) => s._id),
      });

      toast.success("Subscriptions updated");
      setDirty(false);

      const updated = { ...user, subscribedShops: selectedShops };
      setUser(updated);
      setPublicUser(updated);
    } catch {
      toast.error("Failed to update subscriptions");
    } finally {
      setLoadingSave(false);
    }
  };

  // ---------------- UNREGISTER ----------------
  const unregister = async () => {
    setLoadingUnregister(true);
    try {
      await api.delete(`/api/publicUser/delete/${user._id}`);
      toast.success("You are removed");
      clearPublicUser();
      setUser(null);
      setSelectedShops([]);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setLoadingUnregister(false);
    }
  };

  // ---------------- UI REGISTER FORM ----------------
  if (!user) {
    return (
      <div className="signup-page container-fluid py-5">
        <ToastContainer autoClose={2500} />
        <div className="row justify-content-center">
          <div className="col-xl-8 col-lg-9 col-md-10">
            <div className="card signup-card p-4 shadow-sm">
              {/* HEADER */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBackIcon sx={{ color: uiColors.text.primary }} />
                  </IconButton>
                  <img src={logo} alt="Logo" className="signup-logo me-3" />
                  <div>
                    <h2 className="mb-0 signup-heading">Register</h2>
                    <small className="text-muted">Create your account to get updates</small>
                  </div>
                </div>
              </div>

              {/* FORM */}
              <form className="signup-form">
                <div className="step-pane active">
                  <h5 className="section-title">Contact Info</h5>
                  <div className="card inner-card p-3 mb-3 border-accent">
                    <div className="row g-3">
                      {["firstName", "lastName", "email", "contact", "address"].map((field) => (
                        <div key={field} className="col-12">
                          <TextField
                            fullWidth
                            placeholder={
                              field === "firstName"
                                ? "First Name"
                                : field === "lastName"
                                  ? "Last Name"
                                  : field.charAt(0).toUpperCase() + field.slice(1)
                            }
                            name={field}
                            value={form[field]}
                            onChange={updateField}
                            size="small"
                            multiline={field === "address"}
                            rows={field === "address" ? 2 : undefined}
                            sx={{
                              bgcolor: uiColors.inputBg,
                              "& .MuiInputBase-input": { color: "#fff" },
                              "& .MuiInputBase-input::placeholder": {
                                color: "#9ca3af",
                                opacity: 1
                              },
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: uiColors.accent
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <Button
                      onClick={register}
                      disabled={loadingRegister}
                      startIcon={loadingRegister && <CircularProgress size={20} />}
                      sx={{
                        background: uiColors.gradient,
                        color: uiColors.text.primary,
                        px: 4,
                        "&:hover": {
                          background: uiColors.gradientHover,
                          transform: "translateY(-2px)",
                          boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
                        }
                      }}
                    >
                      Register
                    </Button>
                  </div>
                </div>
              </form>
            </div>
            <div className="text-center mt-3">
              <small className="text-muted">Step 1 of 1</small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- UI REGISTERED USER ----------------
  return (
    <div className="signup-page container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-xl-8 col-lg-9 col-md-10">
          <div className="card signup-card p-4 shadow-sm">
            <ToastContainer autoClose={2500} />
            {/* HEADER */}
            <div className="d-flex align-items-center mb-3">
              <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                <ArrowBackIcon sx={{ color: uiColors.text.primary }} />
              </IconButton>
              <img src={logo} alt="Logo" className="signup-logo me-3" />
              <Typography variant="h6" className="mb-0">
                Select Shops
              </Typography>
            </div>

            <Autocomplete
              multiple
              options={shops}
              getOptionLabel={(option) => option.shopName}
              value={selectedShops}
              onChange={(e, value) => {
                setSelectedShops(value);
                setDirty(true);
              }}
              slotProps={{
                paper: {
                  sx: {
                    bgcolor: uiColors.inputBg,
                    color: "#fff"
                  }
                }
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option._id}
                    label={option.shopName}
                    {...getTagProps({ index })}
                    sx={{
                      bgcolor: uiColors.accent,
                      color: "#fff",
                      fontWeight: 500,
                      "& .MuiChip-deleteIcon": {
                        color: "#fff"
                      },
                      "& .MuiChip-deleteIcon:hover": {
                        color: "#ffdddd"
                      }
                    }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select Shops"
                  sx={{
                    bgcolor: uiColors.inputBg,
                    "& .MuiInputBase-input": { color: "#fff" },
                    "& .MuiInputBase-input::placeholder": {
                      color: "#9ca3af",
                      opacity: 1
                    },
                    "& .MuiSvgIcon-root": { color: "#fff" }, // dropdown icon
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: uiColors.accent
                    }
                  }}
                />
              )}
            />

            <Box mt={2} display="flex" gap={2}>
              <Button
                disabled={!dirty || loadingSave}
                onClick={save}
                startIcon={loadingSave && <CircularProgress size={20} sx={{ color: uiColors.text.primary }} />}
                sx={{
                  background: uiColors.gradient,
                  color: uiColors.text.primary,
                  px: 4,
                  "&:hover": {
                    background: uiColors.gradientHover,
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
                  }
                }}
              >
                Save
              </Button>
              <Button
                color="error"
                variant="outlined"
                onClick={unregister}
                disabled={loadingUnregister}
                startIcon={loadingUnregister && <CircularProgress size={20} sx={{ color: uiColors.text.primary }} />}
              >
                Unregister
              </Button>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}