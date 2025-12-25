import React, { useContext } from "react";
import { Box, Typography, Button } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ShopsTopbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        px: 3,
        py: 2,
        borderRadius: 2,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        mb: 3,
      }}
    >
      {/* Left Title */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: "text.primary",
        }}
      >
        Shops
      </Typography>

      {/* Right Side */}
      <Box display="flex" alignItems="center" gap={2.5}>
        <Typography
          variant="body1"
          sx={{ fontWeight: 500, color: "text.secondary" }}
        >
          Hello, {user?.role === "admin" ? "Admin" : user?.name || "Guest"}
        </Typography>

        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
          sx={{
            textTransform: "none",
            px: 2.5,
            py: 0.8,
            borderRadius: 2,
            fontWeight: 500,
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default ShopsTopbar;
