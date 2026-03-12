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
import uiColors from '../../Styles/uiColors';


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
  const navigate = useNavigate();



  useEffect(() => {
    const fetchUsersAndAppointments = async () => {
      try {
        // Fetch all users
        const usersRes = await axios.get(`${DEFAULT_API}/api/users/all`);
        const allUsers = usersRes.data;
        setUsers(allUsers);

        // Fetch future slots
        const slotsRes = await axios.get(`${DEFAULT_API}/api/slots/future`);
        const now = moment.tz(AZ_TIMEZONE);
        const futureSlots = slotsRes.data.filter(slot => {
          const slotStart = moment.tz(`${slot.date} ${slot.startTime}`, 'YYYY-MM-DD HH:mm', AZ_TIMEZONE);
          return slotStart.isAfter(now);
        });

        const data = [];

        futureSlots.forEach(slot => {
          const sections = slot.sections || {};

          const getUserName = (userId) => {
            if (!userId) return null;
            if (userId === "Admin") return "Admin";
            const found = allUsers.find(u => u._id === userId);
            return found ? found.businessName : "Unknown User";
          };

          // Section 1
          const user1 = getUserName(sections.section1?.bookedBy);
          if (user1) {
            data.push({
              id: slot._id + "_s1",
              slotId: slot._id,
              userName: user1,
              section: "Section 1",
              date: slot.date,
              startTime: slot.startTime,
              endTime: slot.endTime
            });
          }

          // Section 2
          const user2 = getUserName(sections.section2?.bookedBy);
          if (user2) {
            data.push({
              id: slot._id + "_s2",
              slotId: slot._id,
              userName: user2,
              section: "Section 2",
              date: slot.date,
              startTime: slot.startTime,
              endTime: slot.endTime
            });
          }
        });

        setAppointments(data);
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
          <ArrowBackIcon sx={{ color: uiColors.text.primary }} />
        </IconButton>
        <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ color: uiColors.text.primary }}>
          Future Appointments
        </Typography>
      </Box>


      <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', bgcolor: uiColors.card, borderRadius: 1 }}>
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: uiColors.text.primary }}>User Name</TableCell>
              <TableCell sx={{ color: uiColors.text.primary }}>Booking Section</TableCell>
              <TableCell sx={{ color: uiColors.text.primary }}>Date</TableCell>
              <TableCell sx={{ color: uiColors.text.primary }}>Start Time</TableCell>
              <TableCell sx={{ color: uiColors.text.primary }}>End Time</TableCell>
              <TableCell sx={{ color: uiColors.text.primary }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from(new Array(rowsPerPage)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton sx={{
                    bgcolor: uiColors.skeleton.baseColor,
                    "&::after": { bgcolor: uiColors.skeleton.highlightColor }
                  }} /></TableCell>
                  <TableCell><Skeleton sx={{
                    bgcolor: uiColors.skeleton.baseColor,
                    "&::after": { bgcolor: uiColors.skeleton.highlightColor }
                  }} /></TableCell>
                  <TableCell><Skeleton sx={{
                    bgcolor: uiColors.skeleton.baseColor,
                    "&::after": { bgcolor: uiColors.skeleton.highlightColor }
                  }} /></TableCell>
                  <TableCell><Skeleton sx={{
                    bgcolor: uiColors.skeleton.baseColor,
                    "&::after": { bgcolor: uiColors.skeleton.highlightColor }
                  }} /></TableCell>
                  <TableCell><Skeleton sx={{
                    bgcolor: uiColors.skeleton.baseColor,
                    "&::after": { bgcolor: uiColors.skeleton.highlightColor }
                  }} /></TableCell>
                </TableRow>
              ))
              : appointments.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography sx={{ py: 3, color: uiColors.text.primary }}>
                        No Future Appointment Found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
                : appointments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((slot, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: uiColors.text.primary }}>{slot.userName || '-'}</TableCell>
                      <TableCell sx={{ color: uiColors.text.primary }}>{slot.section || '-'}</TableCell>
                      <TableCell sx={{ color: uiColors.text.primary }}>{slot.date}</TableCell>
                      <TableCell sx={{ color: uiColors.text.primary }}>{formatTime12Hour(slot.startTime)}</TableCell>
                      <TableCell sx={{ color: uiColors.text.primary }}>{formatTime12Hour(slot.endTime)}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            minWidth: isMobile ? 60 : 120, 
                            background: uiColors.gradient,
                            color: "white",
                            "&:hover": {
                              background: uiColors.gradientHover,
                              transform: "translateY(-2px)",
                              boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
                            }
                          }}
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
        sx={{
          color: "white",
          "& .MuiTablePagination-actions .MuiIconButton-root": {
            color: "white"
          },
          "& .MuiSelect-select, & .MuiInputBase-root, & .MuiTablePagination-displayedRows": {
            color: "white"
          },
          "& .MuiTablePagination-selectIcon": {
            color: "white"
          }
        }}
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
