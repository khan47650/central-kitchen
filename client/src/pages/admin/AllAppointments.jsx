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
import uiColors from '../../Styles/uiColors';




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
  const navigate = useNavigate();

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
        //Fetch all users
        const usersRes = await axios.get(`${DEFAULT_API}/api/users/all`);
        const allUsers = usersRes.data;

        //Fetch all slots
        const slotsRes = await axios.get(`${DEFAULT_API}/api/slots`);
        const filteredSlots = slotsRes.data.filter(slot => !slot.unavailable);

        const data = [];
        filteredSlots.forEach(slot => {
          const bookedOn = slot.date
            ? moment.tz(slot.date, AZ_TIMEZONE).format('MM/DD/YYYY')
            : '-';

          const bookingStart = formatTime12Hour(slot.startTime);
          const bookingEnd = formatTime12Hour(slot.endTime) || '-';

          const sections = slot.sections || {};

          const getUserName = (userId) => {
            if (!userId) return "Not booked";
            if (userId === "Admin") return "Admin";
            const found = allUsers.find(u => u._id === userId);
            return found ? found.businessName : "Unknown User";
          };

          // SECTION 1
          if (sections.section1?.bookedBy) {
            data.push({
              id: slot._id + "_s1",
              slotId: slot._id,
              userName: getUserName(sections.section1.bookedBy),
              section: "Section 1",
              bookedOn,
              bookingStart,
              bookingEnd
            });
          }

          // SECTION 2
          if (sections.section2?.bookedBy) {
            data.push({
              id: slot._id + "_s2",
              slotId: slot._id,
              userName: getUserName(sections.section2.bookedBy),
              section: "Section 2",
              bookedOn,
              bookingStart,
              bookingEnd
            });
          }

          // If no booking
          if (!sections.section1?.bookedBy && !sections.section2?.bookedBy) {
            data.push({
              id: slot._id + "_empty",
              slotId: slot._id,
              userName: "Not booked",
              section: "-",
              bookedOn,
              bookingStart,
              bookingEnd
            });
          }
        });

        //Sort data
        data.sort((a, b) => {
          const dateA = moment.tz(`${a.bookedOn} ${a.bookingStart}`, 'MM/DD/YYYY hh:mm A', AZ_TIMEZONE);
          const dateB = moment.tz(`${b.bookedOn} ${b.bookingStart}`, 'MM/DD/YYYY hh:mm A', AZ_TIMEZONE);
          return dateA - dateB;
        });

        //Set state
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
          <ArrowBackIcon sx={{ color: uiColors.text.primary }} />
        </IconButton>
        <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ color: uiColors.text.primary }}>
          All Appointments
        </Typography>
      </Box>

      <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', bgcolor: uiColors.card, borderRadius: 1 }}>
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: uiColors.text.primary }}>User Name</TableCell>
              <TableCell sx={{ color: uiColors.text.primary }}>Booking Section</TableCell>
              <TableCell sx={{ color: uiColors.text.primary }}>Booked On</TableCell>
              <TableCell sx={{ color: uiColors.text.primary }}>Booking Start</TableCell>
              <TableCell sx={{ color: uiColors.text.primary }}>Booking End</TableCell>
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
                        No Appointment Found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
                : appointments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(row => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ color: uiColors.text.primary }}>{row.userName}</TableCell>
                      <TableCell sx={{ color: uiColors.text.primary }}>{row.section}</TableCell>
                      <TableCell sx={{ color: uiColors.text.primary }}>{row.bookedOn}</TableCell>
                      <TableCell sx={{ color: uiColors.text.primary }}>{row.bookingStart}</TableCell>
                      <TableCell sx={{ color: uiColors.text.primary }}>{row.bookingEnd}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          sx={{
                            minWidth: isMobile ? 60 : 120, background: uiColors.gradient,
                            color: "white",
                            "&:hover": {
                              background: uiColors.gradientHover,
                              transform: "translateY(-2px)",
                              boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
                            }
                          }}
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

export default AllAppointments;
