import React, { useContext } from "react";
import { Box, Typography, Button, useTheme, useMediaQuery } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import uiColors from "../Styles/uiColors";

const ShopsTopbar = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        background: "linear-gradient( 90deg, #22E3FF, #2F5BFF, #8A4DFF)",
        px: { xs: 2, sm: 3 },
        py: { xs: 1.5, sm: 2 },
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        mb: 3,
      }}
    >
      {/* Title */}
      <Typography
        variant={isMobile ? "h6" : "h5"}
        sx={{ fontWeight: 700, color: uiColors.text.primary }}
      >
        Food Trucks
      </Typography>

      {/* Right side */}
      <Box display="flex" alignItems="center" gap={2}>
        {/* Hidden on mobile */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: uiColors.text.primary,
            display: { xs: "none", sm: "block" },
          }}
        >
          {loading ? "Loading..." : `Hello, ${user?.fullName || "Guest"}`}
        </Typography>

        <Button
          onClick={() => navigate("/", { replace: true })}
          sx={{
            textTransform: "none",
            px: 2,
            py: 0.6,
            borderRadius: 1,
            border: "1px solid rgba(255,255,255,0.6)",
            color: "#fff",
            backgroundColor: "rgba(255,255,255,0.1)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.25)",
              transform: "translateY(-1px)",
            },
          }}
        >
          Home
        </Button>

        {!user ? (
          <Button
            onClick={() => navigate("/get-updates")}
            sx={{
              textTransform: "none",
              px: 1.5,
              py: 0.6,
              borderRadius: 1,
              border: "1px solid rgba(255,255,255,0.6)",
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.1)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.25)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Get Updates
          </Button>
        ) : (
          <Button
            onClick={handleLogout}
            sx={{
              textTransform: "none",
              px: 1.5,
              py: 0.6,
              borderRadius: 1,
              border: "1px solid rgba(255,255,255,0.6)",
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.1)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.25)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Logout
          </Button>
        )}

      </Box>
    </Box>
  );
};

export default ShopsTopbar;
