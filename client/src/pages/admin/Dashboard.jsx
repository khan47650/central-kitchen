import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Stack,
  Button,
  LinearProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
} from '@mui/material';
import {
  EventAvailable,
  People,
  PendingActions,
  Today,
  BarChart,
} from '@mui/icons-material';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from "axios";
import moment from 'moment-timezone';
import { Skeleton } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import "../../Styles/dashboard.css"
import Marquee from "react-fast-marquee"
import uiColors from '../../Styles/uiColors';



const DEFAULT_API = process.env.REACT_APP_API_URL || "";
const AZ_TIMEZONE = 'America/Phoenix';


const AdminDashboard = () => {

  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {

    const fetchStats = async () => {
      try {
        const resStats = await axios.get(`${DEFAULT_API}/api/stats/adminStats`);
        setStats(resStats.data);

        const resRecent = await axios.get(`${DEFAULT_API}/api/stats/recentActivities`);
        setRecentActivities(resRecent.data.recentActivities || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const weekly = await axios.get(`${DEFAULT_API}/api/users/latest-announcements`);

        setAnnouncements(weekly.data.announcements || []);
      } catch (err) {
        console.error("Announcement API error:", err);
      }
    };


    fetchStats();
    fetchAnnouncements();

  }, []);

  if (loading) {
    return (
      <Box sx={{
        p: 2,
        boxSizing: 'border-box',
      }}>
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
        <Grid container spacing={2} sx={{ mt: 2 }}>
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
      label: "Today's Appointments",
      value: stats?.todayAppointments?.total ?? 0,
      sub: `${stats?.todayAppointments?.completed ?? 0} completed • ${stats?.todayAppointments?.upcoming ?? 0} upcoming`,
      icon: <EventAvailable />,
      color: "#1976d2",
      path: "/admin/appointments"
    },
    {
      id: 2,
      label: "Pending Approvals",
      value: stats?.pendingApprovals?.total ?? 0,
      sub: `${stats?.pendingApprovals?.pendingThisWeek ?? 0} pending • ${stats?.pendingApprovals?.awaitingThisWeek ?? 0} awaiting`,
      icon: <PendingActions />,
      color: "#f57c00",
      path: "/admin/users/pending"
    },
    {
      id: 3,
      label: "Active Users",
      value: stats?.activeUsers?.total ?? 0,
      sub: `${stats?.activeUsers?.newThisWeek ?? 0} new today`,
      icon: <People />,
      color: "#2e7d32",
      path: "/admin/users"
    },
    {
      id: 4,
      label: "Open Slots",
      value: stats?.openSlots ?? 0,
      sub: "Slots available this week",
      icon: <Today />,
      color: "#9c27b0",
      path: "/admin/schedule"
    },
  ];

  return (
    <Box sx={{
      p: 2,
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, flexWrap: 'wrap', }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={700} sx={{
            background: uiColors.gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Welcome Admin
          </Typography>
          <Typography variant="body2" sx={{ color: uiColors.text.secondary }}>
            Here's a quick overview of today's activity
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mt: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' }, flexWrap: 'wrap' }}
        >
          <Button variant="contained" sx={{
            background: uiColors.gradient,
            width: { xs: '100%', sm: 'auto' },
            fontSize: { xs: 14, sm: 16 },
            minWidth: 120,
            color: "white",
            "&:hover": {
              background: uiColors.gradientHover,
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
            }

          }}
            onClick={() => navigate("/admin/schedule")}>
            Create Slot
          </Button>
          <Button sx={{
            background: uiColors.gradient,
            width: { xs: '100%', sm: 'auto' },
            fontSize: { xs: 14, sm: 16 },
            minWidth: 120,
            color: "white",
            "&:hover": {
              background: uiColors.gradientHover,
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
            }
          }}>
            Export Report
          </Button>
        </Stack>
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
              width: "100%",
              maxWidth: "100vw",
            }}
          >
            <Marquee
              gradient={false}
              speed={50}
              style={{ width: "100%" }}
            >
              {announcements.map((a, i) => (
                <span key={i} style={{ marginRight: 60 }}>
                  <b>{a.title}:</b> {a.description}
                </span>
              ))}
            </Marquee>
          </Box>
        )}
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {statCards.map((c) => (
          <Grid item xs={12} sm={6} md={3} key={c.id}>
            <Paper
              elevation={2}
              onClick={() => navigate(c.path)}
              className='dashboard-card'
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                bgcolor: uiColors.card,
                color: uiColors.text.primary,
                boxShadow: `0 0 10px ${uiColors.cardGlow}`,
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 0 20px ${uiColors.teal}`
                },
                flexDirection: { xs: 'row', md: 'row' },
                minHeight: 150,
                overflow: 'hidden',
                wordBreak: 'break-word',
                cursor: 'pointer'
              }}

            >
              <Avatar sx={{ bgcolor: c.color, width: 56, height: 56 }}>
                {c.icon}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" color="#ffff" noWrap>
                  {c.label}
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }} noWrap>
                  {c.value}
                </Typography>
                <Typography variant="body2" color="#ffff" noWrap>
                  {c.sub}
                </Typography>
              </Box>
            </Paper>
          </Grid>

        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{
            p: { xs: 2, md: 3 }, bgcolor: uiColors.card,
            color: uiColors.text.primary,
            boxShadow: `0 0 10px ${uiColors.cardGlow}`,
            transition: "all 0.3s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: `0 0 20px ${uiColors.teal}`
            },
            cursor: "pointer"
          }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              System Utilization
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="uiColors.text.primary">Booking Throughput</Typography>
                <LinearProgress variant="determinate" value={75} sx={{ height: 10, borderRadius: 2, mt: 1 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="uiColors.text.primary ">Approval Rate</Typography>
                <LinearProgress variant="determinate" value={62} sx={{ height: 10, borderRadius: 2, mt: 1 }} color="success" />
              </Box>
              <Box>
                <Typography variant="body2" color="uiColors.text.primary">Server Load</Typography>
                <LinearProgress variant="determinate" value={42} sx={{ height: 10, borderRadius: 2, mt: 1 }} color="warning" />
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Recent Activity
            </Typography>

            <Box sx={{ overflowX: 'auto', width: '100%' }}>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: uiColors.text.primary }}>User</TableCell>
                    <TableCell sx={{ color: uiColors.text.primary }}>Action</TableCell>
                    <TableCell sx={{ color: uiColors.text.primary }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivities.map((r, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ color: uiColors.text.primary }}>{r.user}</TableCell>
                      <TableCell sx={{ color: uiColors.text.primary }}>{r.action}</TableCell>
                      <TableCell sx={{ color: uiColors.text.primary }}>{moment.tz(r.date, AZ_TIMEZONE).format('YYYY-MM-DD HH:mm')}</TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{
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
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Quick Stats
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="uiColors.text.primary ">Today</Typography>
                <Typography variant="h5" fontWeight={700}> {stats?.todayAppointments?.total ? `${stats?.todayAppointments?.total} bookings`
                  : "0 bookings"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="uiColors.text.primary ">This Week</Typography>
                <Typography variant="h5" fontWeight={700}>  {stats?.currentWeekBookedSlots ? `${stats?.currentWeekBookedSlots} bookings` : "0 bookings"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="uiColors.text.primary ">Active Users</Typography>
                <Typography variant="h5" fontWeight={700}> {stats?.activeUsers.total ?? 0}</Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Button variant="contained" sx={{
              color: "white",
              background: uiColors.gradient,
              "&:hover": {
                background: uiColors.gradientHover,
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
              }
            }} fullWidth startIcon={<BarChart />}>View Analytics</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;