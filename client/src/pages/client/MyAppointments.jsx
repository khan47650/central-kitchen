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
import uiColors from '../../Styles/uiColors';




const AZ_TIMEZONE = 'America/Phoenix';


const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(null);

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
      if (!user?._id) return;

      setCancelling(slotId);

      const { data: slot } = await axios.get(`${DEFAULT_API}/api/slots/${slotId}`);
      if (!slot) return;

      let clientSection = null;
      if (slot.sections.section1.bookedBy === user._id) clientSection = 'section1';
      else if (slot.sections.section2.bookedBy === user._id) clientSection = 'section2';

      if (!clientSection) return;

      const otherSection = clientSection === 'section1' ? 'section2' : 'section1';

      if (!slot.sections[otherSection].booked) {
        await axios.delete(`${DEFAULT_API}/api/slots/delete/${slotId}`);
        setAppointments(prev => prev.filter(appt => appt.id !== slotId));
        return;
      }

      await axios.post(`${DEFAULT_API}/api/slots/clear-section`, {
        slotId,
        section: clientSection,
        userId: user._id,
        isAdmin: false
      });

      setAppointments(prev =>
        prev.filter(appt => appt.id !== slotId)
      );

    } catch (err) {
      console.error('Failed to cancel appointment:', err);
    } finally {
      setCancelling(null);
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
            <ArrowBackIcon sx={{ color: uiColors.text.primary }} />
          </IconButton>
          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ color: uiColors.text.primary }}>
            {heading}
          </Typography>
        </Box>

      </Toolbar>

      <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto', bgcolor: uiColors.card, borderRadius: 1 }}>
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: uiColors.text.primary }}>Booked On</TableCell>
              <TableCell sx={{ color: uiColors.text.primary }}>Booking Start</TableCell>
              <TableCell sx={{ color: uiColors.text.primary }}>Booking End</TableCell>
              {type !== 'completed' && (
                <TableCell sx={{ color: uiColors.text.primary }}>Action</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(5)).map((_, index) => (
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
                </TableRow>
              ))
            ) : appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography sx={{ py: 3, color: uiColors.text.primary }}>
                    No Appointment Found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              appointments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell sx={{ color: uiColors.text.primary }}>{appt.bookedOn}</TableCell>
                    <TableCell sx={{ color: uiColors.text.primary }}>{formatTime12Hour(appt.startTime)}</TableCell>
                    <TableCell sx={{ color: uiColors.text.primary }}>{formatTime12Hour(appt.endTime)}</TableCell>
                    {type !== 'completed' && (
                      <TableCell>
                        <Button
                          size="small"
                          sx={{
                            minWidth: isMobile ? 60 : 100, background: uiColors.gradient,
                            color: "white",
                            "&:hover": {
                              background: uiColors.gradientHover,
                              transform: "translateY(-2px)",
                              boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
                            }
                          }}
                          onClick={() => handleCancel(appt.id)}
                          disabled={cancelling === appt.id}
                        >
                          {cancelling === appt.id ? 'Cancelling...' : 'Cancel'}
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
    </Box>
  );
};

export default MyAppointments;
