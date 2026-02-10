import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Button, Skeleton,
  IconButton,
  Box
} from '@mui/material';
import moment from 'moment-timezone';
import { useMediaQuery, Paper, TableContainer, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SlotDetailsDialog from '../../components/SlotDetailsDialog';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const AZ_TIMEZONE = 'America/Phoenix';


const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate=useNavigate();

  const formatTime12Hour = (time24) => {
    if (!time24) return '-';
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  useEffect(() => {
    const fetchUsersAndAppointments = async () => {
      try {
        // Fetch all users
        const usersRes = await axios.get(`${DEFAULT_API}/api/users/all`);
        const allUsers = usersRes.data;

        // Fetch all slots
        const slotsRes = await axios.get(`${DEFAULT_API}/api/slots`);
        const filteredSlots = slotsRes.data.filter(slot => !slot.unavailable);
        const data = filteredSlots.map(slot => {
          let userName = "Not booked";

          if (slot.bookedBy) {
            if (slot.bookedBy === "Admin") {
              userName = "Admin";
            } else if (typeof slot.bookedBy === "string") {
              // If it's a valid userId
              const foundUser = allUsers.find(u => u._id === slot.bookedBy);
              userName = foundUser ? foundUser.businessName : "Unknown User";
            } else if (typeof slot.bookedBy === "object") {
              // If backend returns populated user object
              userName = slot.bookedBy.fullName || "Unknown";
            }
          }

          return {
            id: slot._id,
            userName,
            bookedOn: slot.date ? moment.tz(slot.date, AZ_TIMEZONE).format('MM/DD/YYYY') : '-',

            bookingStart: formatTime12Hour(slot.startTime),
            bookingEnd: formatTime12Hour(slot.endTime) || '-'
          };
        });

        // Sort by date + startTime for consistent order
        data.sort((a, b) => {
          const dateA = moment.tz(`${a.bookedOn} ${a.bookingStart}`, 'MM/DD/YYYY HH:mm', AZ_TIMEZONE);

          const dateB = moment.tz(`${b.bookedOn} ${b.bookingStart}`, 'MM/DD/YYYY HH:mm', AZ_TIMEZONE);

          return dateA - dateB;
        });

        setAppointments(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch users or appointments:', err);
        setLoading(false);
      }
    };

    fetchUsersAndAppointments();
  }, []);

  const handleViewDetails = (slot) => {
    setSelectedSlot(slot);
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
    <Box p={3}>
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
            {loading
              ? Array.from(new Array(rowsPerPage)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))
              : appointments.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No appointments found
                    </TableCell>
                  </TableRow>
                )
                : appointments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.userName}</TableCell>
                      <TableCell>{row.bookedOn}</TableCell>
                      <TableCell>{row.bookingStart}</TableCell>
                      <TableCell>{row.bookingEnd}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ minWidth: isMobile ? 60 : 120, color: 'white' }}
                          onClick={() => handleViewDetails(row)}
                        >
                          {isMobile ? 'VIEW' : 'VIEW DETAILS'}
                        </Button>

                      </TableCell>
                    </TableRow>
                  ))
            }
          </TableBody>

        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={appointments.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
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

export default AllAppointments;
