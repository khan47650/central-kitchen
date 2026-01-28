import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  TablePagination,
  Toolbar,
  Button,
  Skeleton,
  useMediaQuery,
  IconButton
} from '@mui/material';
import axios from 'axios';
import moment from 'moment-timezone';
import { useTheme } from '@mui/material/styles';
import { useSearchParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';




const AZ_TIMEZONE = 'America/Phoenix';


const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const navigate=useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));



  const { user } = useContext(AuthContext);
  const DEFAULT_API = process.env.REACT_APP_API_URL || "";

  useEffect(() => {
    const fetchMyAppointments = async () => {
      setLoading(true);
      try {
        if (!user?._id) return;


        let endpoint = `/api/slots/my/${user._id}`;

        if (type === 'upcoming') {
          endpoint = `/api/stats/client/upcoming/${user._id}`;
        }
        if (type === 'completed') {
          endpoint = `/api/stats/client/completed/${user._id}`;
        }

        const res = await axios.get(DEFAULT_API + endpoint);


        const formatted = res.data.map(slot => ({
          id: slot._id,
          bookedOn: slot.date ? moment.tz(slot.date, AZ_TIMEZONE).format('YYYY-MM-DD') : '-',
          startTime: slot.startTime,
          endTime: slot.endTime || '-',
        }));

        setAppointments(formatted);
      } catch (err) {
        console.error('Failed to fetch my appointments:', err);
      }
      setLoading(false);
    };

    fetchMyAppointments();
  }, [user]);

  const formatTime12Hour = (time24) => {
    if (!time24 || time24 === '-') return '-';
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const handleCancel = async (slotId) => {
    try {
      // const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
      // if (!confirmCancel) return;

      await axios.delete(`${DEFAULT_API}/api/slots/delete/${slotId}`);

      setAppointments(prev => prev.filter(appt => appt.id !== slotId));
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      alert('Failed to cancel appointment');
    }
  };

  const heading =
    type === 'upcoming'
      ? 'Upcoming Appointments'
      : type === 'completed'
        ? 'Completed Appointments'
        : 'My Appointments';

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={isMobile ? 1 : 3}>
      <Toolbar>
        <Box sx={{
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>

          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant={isMobile ? 'h6' : 'h5'}>
            {heading}
          </Typography>
        </Box>

      </Toolbar>

      <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell>Booked On</TableCell>
              <TableCell>Booking Start</TableCell>
              <TableCell>Booking End</TableCell>
              {type !== 'completed' && (
                <TableCell>Action</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))
            ) : appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No appointments found.
                </TableCell>
              </TableRow>
            ) : (
              appointments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell>{appt.bookedOn}</TableCell>
                    <TableCell>{formatTime12Hour(appt.startTime)}</TableCell>
                    <TableCell>{formatTime12Hour(appt.endTime)}</TableCell>
                    {type !== 'completed' && (
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ minWidth: isMobile ? 60 : 100 }}
                          onClick={() => handleCancel(appt.id)}
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    )}

                  </TableRow>
                ))
            )}
          </TableBody>

        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 30, 50]}
        component="div"
        count={appointments.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default MyAppointments;
