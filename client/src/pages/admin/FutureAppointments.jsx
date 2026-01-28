import React, { useState, useEffect } from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Typography, Box,
  Button, Skeleton,
  IconButton
} from '@mui/material';
import moment from 'moment-timezone';
import axios from 'axios';
import { useMediaQuery, TableContainer } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SlotDetailsDialog from '../../components/SlotDetailsDialog';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const AZ_TIMEZONE = 'America/Phoenix';


const FutureAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate=useNavigate();



  useEffect(() => {
    const fetchUsersAndAppointments = async () => {
      try {
        //Fetch all users
        const usersRes = await axios.get(`${DEFAULT_API}/api/users/all`);
        const allUsers = usersRes.data;
        setUsers(allUsers);

        //Fetch future slots
        const slotsRes = await axios.get(`${DEFAULT_API}/api/slots/future`);
        const now = moment.tz(AZ_TIMEZONE);
        const futureSlots = slotsRes.data.filter(slot => {
          const slotStart = moment.tz(`${slot.date}
         ${slot.startTime}`,
            'YYYY-MM-DD HH:mm',
            AZ_TIMEZONE
          );
          return slotStart.isAfter(now);
        });

        //Map slots to include userName
        const mappedSlots = futureSlots.map(slot => {
          let userName = "Not booked";

          if (slot.bookedBy) {
            if (slot.bookedBy === "Admin") {
              userName = "Admin";
            } else if (typeof slot.bookedBy === "string" && /^[0-9a-fA-F]{24}$/.test(slot.bookedBy)) {
              const foundUser = allUsers.find(u => u._id === slot.bookedBy);
              userName = foundUser ? foundUser.businessName : "Unknown User";
            } else if (typeof slot.bookedBy === "object") {
              userName = slot.bookedBy.fullName || "Unknown";
            }
          }

          return {
            ...slot,
            userName
          };
        });

        setAppointments(mappedSlots);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching users or appointments:', err);
        setLoading(false);
      }
    };

    fetchUsersAndAppointments();
  }, []);

  const formatTime12Hour = (time24) => {
    if (!time24) return '-';
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
          Future Appointments
        </Typography>
      </Box>


      <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell>User Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
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
                      No future appointments
                    </TableCell>
                  </TableRow>
                )
                : appointments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((slot, index) => (
                    <TableRow key={index}>
                      <TableCell>{slot.userName || '-'}</TableCell>
                      <TableCell>{slot.date}</TableCell>
                      <TableCell>{formatTime12Hour(slot.startTime)}</TableCell>
                      <TableCell>{formatTime12Hour(slot.endTime)}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ minWidth: isMobile ? 60 : 120, color: 'white' }}
                          onClick={() => handleViewDetails(slot)}
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

export default FutureAppointments;
