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
  LinearProgress,
  Stack,
  Button,
  Divider,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { EventAvailable, CheckCircle, Verified } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import moment from 'moment';
import '../../Styles/clientDashboard.css';

const DEFAULT_API = process.env.REACT_APP_API_URL || '';

const ClientDashboard = () => {
  const { user, accessToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id ) return;

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress size={60} />
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
      <Typography variant="h5" className="dashboard-header">
        Welcome {user?.fullName || 'Client'}
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.id}>
            <Paper
              className="stat-card"
              sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}
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

      {/* Bookings & Summary */}
      <Grid container spacing={2}>
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

       <Grid item xs={12} md={4}>
  <Paper className="section" sx={{ p: 2 }}>
    <Typography variant="h6" className="section-title">
      Activity Summary
    </Typography>
    <Stack spacing={2}>
      <Box>
        <Typography variant="body2">Booking Completion</Typography>
        <LinearProgress variant="determinate" value={80} />
      </Box>
      <Box>
        <Typography variant="body2">Cancellation Rate</Typography>
        <LinearProgress variant="determinate" value={20} />
      </Box>
    </Stack>
    <Divider sx={{ my: 2 }} />
    <Button variant="contained" fullWidth>
      View Insights
    </Button>
  </Paper>
</Grid>

      </Grid>
    </Box>
  );
};

export default ClientDashboard;
