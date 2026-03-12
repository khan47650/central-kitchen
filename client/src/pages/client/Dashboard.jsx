import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar
} from '@mui/material';
import { EventAvailable, CheckCircle, Verified } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import moment from 'moment';
import '../../Styles/clientDashboard.css';
import { Skeleton } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import Marquee from "react-fast-marquee"
import uiColors from '../../Styles/uiColors';

const DEFAULT_API = process.env.REACT_APP_API_URL || '';

const ClientDashboard = () => {
  const { user, accessToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?._id) return;

    const fetchClientData = async () => {
      try {
        const res = await axios.get(`${DEFAULT_API}/api/stats/clientDashboard/${user._id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setStats(res.data.stats || {});
        setRecentBookings(res.data.recentBookings || []);
      } catch (err) {
        console.error('Error fetching client dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [user, accessToken]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const weekly = await axios.get(`${DEFAULT_API}/api/users/latest-announcements`);
        const latest = await axios.get(`${DEFAULT_API}/api/users/latest-announcement`);

        setAnnouncements(weekly.data.announcements || []);
        setLatestAnnouncement(latest.data.announcement || null);
      } catch (err) {
        console.error("Announcement API error:", err);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: "100%" }}>
        {/* Header */}
        <Skeleton variant="text" width={200} height={40} sx={{
          bgcolor: uiColors.skeleton.baseColor,
          "&::after": { bgcolor: uiColors.skeleton.highlightColor }
        }} />
        <Skeleton variant="text" width={300} height={20} sx={{
          bgcolor: uiColors.skeleton.baseColor,
          "&::after": { bgcolor: uiColors.skeleton.highlightColor }
        }} />

        {/* Stat cards */}
        <Grid container spacing={2} sx={{ mt: 2 }} >
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={150} sx={{
                bgcolor: uiColors.skeleton.baseColor,
                "&::after": { bgcolor: uiColors.skeleton.highlightColor }
              }} />
            </Grid>
          ))}
        </Grid>

        {/* Content */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rounded" height={350} sx={{
              bgcolor: uiColors.skeleton.baseColor,
              "&::after": { bgcolor: uiColors.skeleton.highlightColor }
            }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={350} sx={{
              bgcolor: uiColors.skeleton.baseColor,
              "&::after": { bgcolor: uiColors.skeleton.highlightColor }
            }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  const statCards = [
    {
      id: 1,
      label: 'Upcoming Bookings',
      value: stats?.upcoming ?? 0,
      icon: <EventAvailable />,
      color: '#1976d2',

    },
    {
      id: 2,
      label: 'Completed',
      value: stats?.completed ?? 0,
      icon: <CheckCircle />,
      color: '#2e7d32',
    },
    {
      id: 3,
      label: 'Profile Status',
      value: 'Verified',
      icon: <Verified />,
      color: '#9c27b0',
    },
  ];

  return (
    <Box className="dashboard-container">
      <Typography variant="h5" sx={{
        background: uiColors.gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}>
        Welcome {user?.fullName || 'Client'}
      </Typography>

      {announcements.length > 0 && (
        <Box
          sx={{
            background: uiColors.teal,
            color: "white",
            py: 1,
            px: 2,
            borderRadius: 1,
            mb: 1,
            mt: 2,
            overflow: "hidden",
          }}
        >
          <Marquee gradient={false} speed={50}>
            {announcements.map((a, i) => (
              <span key={i} style={{ marginRight: 60 }}>
                <b>{a.title}:</b> {a.description}
              </span>
            ))}
          </Marquee>
        </Box>
      )}
      {/* LEFT SIDE / Main Content */}
      <Grid container spacing={2} sx={{ mb: 1, mt: 1 }} alignItems="flex-start">
        {/* LEFT SIDE */}
        <Grid item xs={12} md={8} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {latestAnnouncement && (
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                bgcolor: uiColors.card,
                color: uiColors.text.primary,
                boxShadow: `0 0 10px ${uiColors.cardGlow}`,
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 0 20px ${uiColors.teal}`
                },
                cursor: "pointer"
              }}
            >
              {latestAnnouncement.image && (
                <Box
                  component="img"
                  src={latestAnnouncement.image}
                  sx={{
                    width: "100%",
                    maxHeight: 250,
                    objectFit: "cover",
                    borderRadius: 2,
                    mb: 2,
                  }}
                />
              )}

              <Typography variant="h5" sx={{ fontWeight: 700, color: uiColors.text.primary }}>
                {latestAnnouncement.title}
              </Typography>

              <Typography variant="body1" sx={{ color: uiColors.text.primary, mt: 1 }}>
                {latestAnnouncement.description}
              </Typography>
            </Paper>
          )}

          {/* Recent Bookings should always be directly below latestAnnouncement */}
          <Paper className="section" sx={{
            p: 2, bgcolor: uiColors.card,
            color: uiColors.text.primary,
            boxShadow: `0 0 10px ${uiColors.cardGlow}`,
            transition: "all 0.3s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: `0 0 20px ${uiColors.teal}`
            },
            cursor: "pointer"
          }}>
            <Typography variant="h6" className="section-title">
              Recent Bookings
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: uiColors.text.primary }}>Service</TableCell>
                  <TableCell sx={{ color: uiColors.text.primary }}>Date</TableCell>
                  <TableCell sx={{ color: uiColors.text.primary }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell sx={{ color: uiColors.text.primary }}>{booking.service}</TableCell>
                    <TableCell sx={{ color: uiColors.text.primary }}>{moment(booking.date).format("YYYY-MM-DD HH:mm")}</TableCell>
                    <TableCell sx={{ color: uiColors.text.primary }}>{booking.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* RIGHT SIDE - Stats Cards */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2} direction="column">
            {statCards.map((card) => (
              <Grid item key={card.id}>
                <Paper
                  onClick={() => {
                    if (card.label === "Upcoming Bookings")
                      navigate("/client/my-appointments?type=upcoming");
                    if (card.label === "Completed")
                      navigate("/client/my-appointments?type=completed");
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    cursor: "pointer",
                    bgcolor: uiColors.card, // <-- here is your card background
                    color: uiColors.text.primary,
                    borderRadius: 2,
                    boxShadow: `0 0 10px ${uiColors.cardGlow}`,
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 0 20px ${uiColors.teal}`
                    }
                  }}
                >
                  <Avatar sx={{ bgcolor: card.color, width: 50, height: 50 }}>{card.icon}</Avatar>
                  <Box>
                    <Typography className="stat-label">{card.label}</Typography>
                    <Typography className="stat-value">{card.value}</Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Bookings & Summary */}
      {/* <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper className="section" sx={{ p: 2 }}>
            <Typography variant="h6" className="section-title">
              Recent Bookings
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.service}</TableCell>
                    <TableCell>{moment(booking.date).format('YYYY-MM-DD HH:mm')}</TableCell>
                    <TableCell>{booking.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>



      </Grid> */}
    </Box >
  );
};

export default ClientDashboard;
