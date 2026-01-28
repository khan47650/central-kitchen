import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  Button,
  Toolbar,
  Skeleton,
  IconButton
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import moment from 'moment-timezone';
import { useMediaQuery, } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SlotDetailsDialog from '../../components/SlotDetailsDialog';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AZ_TIMEZONE = 'America/Phoenix';

const ClientAppointments = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);



  const DEFAULT_API = process.env.REACT_APP_API_URL || "";

  useEffect(() => {
    const fetchUsersAndAppointments = async () => {
      setLoading(true);
      try {
        // Fetch all users
        const usersRes = await axios.get(`${DEFAULT_API}/api/users/all`);
        setUsers(usersRes.data);

        // Fetch all slots  
        const slotsRes = await axios.get(`${DEFAULT_API}/api/slots`);
        const formatted = slotsRes.data.map(slot => {
          let userName = "Not booked";

          if (slot.bookedBy) {
            if (slot.bookedBy === "Admin") {
              userName = "Admin";
            } else if (typeof slot.bookedBy === "string" && /^[0-9a-fA-F]{24}$/.test(slot.bookedBy)) {
              const foundUser = usersRes.data.find(u => u._id === slot.bookedBy);
              userName = foundUser ? foundUser.businessName : "User";
            } else if (typeof slot.bookedBy === "object") {
              userName = slot.bookedBy.fullName || "Unknown";
            }
          }

          return {
            id: slot._id,
            userName,
            bookedOn: slot.date ? moment.tz(slot.date, AZ_TIMEZONE).format('YYYY-MM-DD') : '-',
            startTime: slot.startTime,
            endTime: slot.endTime || '-',
          };
        });

        setAppointments(formatted);

      } catch (err) {
        console.error('Failed to fetch appointments or users:', err);
      }
      setLoading(false);
    };

    fetchUsersAndAppointments();
  }, []);


  const formatTime12Hour = (time24) => {
    if (!time24 || time24 === '-') return '-';
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const handleViewDetails = (slot) => {
    const formattedSlot = {
      ...slot,
      startTime: formatTime12Hour(slot.startTime),
      endTime: formatTime12Hour(slot.endTime)
    };
    setSelectedSlot(formattedSlot);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSlot(null);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={isMobile ? 1 : 3}>
      <Box sx={{
        mb: 3,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>

        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant={isMobile ? 'h6' : 'h5'}>
          All Appointments
        </Typography>
      </Box>


      <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell>User Name</TableCell>
              <TableCell>Booked On</TableCell>
              <TableCell>Booking Start</TableCell>
              <TableCell>Booking End</TableCell>
              <TableCell>Action</TableCell>
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
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))
            ) : appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No appointments found.
                </TableCell>
              </TableRow>
            ) : (
              appointments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell>{appt.userName}</TableCell>
                    <TableCell>{appt.bookedOn}</TableCell>
                    <TableCell>{formatTime12Hour(appt.startTime)}</TableCell>
                    <TableCell>{formatTime12Hour(appt.endTime)}</TableCell>

                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ minWidth: isMobile ? 60 : 120, color: 'white' }}
                        onClick={() => handleViewDetails(appt)}
                      >
                        {isMobile ? 'VIEW' : 'VIEW DETAILS'}
                      </Button>

                    </TableCell>
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

      <SlotDetailsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        slot={selectedSlot}
      />

    </Box>

  );
};

export default ClientAppointments;
