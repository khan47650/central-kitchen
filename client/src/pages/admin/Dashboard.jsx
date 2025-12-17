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
import { CircularProgress } from "@mui/material";
import moment from 'moment-timezone';


const DEFAULT_API = process.env.REACT_APP_API_URL || "";
const AZ_TIMEZONE = 'America/Phoenix';


const AdminDashboard = () => {

  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

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

    fetchStats();

  }, []);


  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress size={60} />
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
    },
    {
      id: 2,
      label: "Pending Approvals",
      value: stats?.pendingApprovals?.total ?? 0,
      sub: `${stats?.pendingApprovals?.pendingThisWeek ?? 0} pending • ${stats?.pendingApprovals?.awaitingThisWeek ?? 0} awaiting`,
      icon: <PendingActions />,
      color: "#f57c00",
    },
    {
      id: 3,
      label: "Active Users",
      value: stats?.activeUsers?.total ?? 0,
      sub: `${stats?.activeUsers?.newThisWeek ?? 0} new today`,
      icon: <People />,
      color: "#2e7d32",
    },
    {
      id: 4,
      label: "Open Slots",
      value: stats?.openSlots ?? 0,
      sub: "Slots available this week",
      icon: <Today />,
      color: "#9c27b0",
    },
  ];

  // const recent = [
  //   { id: 1, user: 'Umair', action: 'Booked', when: '2025-11-07 09:00' },
  //   { id: 2, user: 'Fatima', action: 'Cancelled', when: '2025-11-07 08:30' },
  //   { id: 3, user: 'Ali', action: 'Approved', when: '2025-11-06 16:12' },
  // ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Welcome Admin
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here's a quick overview of today's activity
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button variant="contained">Create Slot</Button>
          <Button variant="outlined">Export Report</Button>
        </Stack>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {statCards.map((c) => (
       <Grid item xs={12} sm={6} md={3} key={c.id}>
  <Paper
    elevation={2}
    sx={{
      p: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      height: '150px', // fixed height for all cards
      minHeight: '150px',
    }}
  >
    <Avatar sx={{ bgcolor: c.color, width: 56, height: 56 }}>
      {c.icon}
    </Avatar>
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle2" color="text.secondary">
        {c.label}
      </Typography>
      <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
        {c.value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {c.sub}
      </Typography>
    </Box>
  </Paper>
</Grid>

        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              System Utilization
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">Booking Throughput</Typography>
                <LinearProgress variant="determinate" value={75} sx={{ height: 10, borderRadius: 2, mt: 1 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Approval Rate</Typography>
                <LinearProgress variant="determinate" value={62} sx={{ height: 10, borderRadius: 2, mt: 1 }} color="success" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Server Load</Typography>
                <LinearProgress variant="determinate" value={42} sx={{ height: 10, borderRadius: 2, mt: 1 }} color="warning" />
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Recent Activity
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentActivities.map((r, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{r.user}</TableCell>
                    <TableCell>{r.action}</TableCell>
                    <TableCell>{moment.tz(r.date, AZ_TIMEZONE).format('YYYY-MM-DD HH:mm')}</TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Quick Stats
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Today</Typography>
                <Typography variant="h5" fontWeight={700}> {stats?.todayAppointments?.total ? `${stats?.todayAppointments?.total} bookings`
      : "0 bookings"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">This Week</Typography>
                <Typography variant="h5" fontWeight={700}>  {stats?.currentWeekBookedSlots  ? `${stats?.currentWeekBookedSlots} bookings` : "0 bookings"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Active Users</Typography>
                <Typography variant="h5" fontWeight={700}> {stats?.activeUsers.total ?? 0}</Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Button variant="contained" fullWidth startIcon={<BarChart />}>View Analytics</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;