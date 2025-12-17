import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Button
} from '@mui/material';
import axios from 'axios';
import moment from 'moment-timezone';


const AZ_TIMEZONE = 'America/Phoenix';


const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);

  const { user } = useContext(AuthContext); 
  const DEFAULT_API = process.env.REACT_APP_API_URL || "";

  useEffect(() => {
    const fetchMyAppointments = async () => {
      try {
        if (!user?._id) return;

        const res = await axios.get(`${DEFAULT_API}/api/slots/my/${user._id}`);

        const formatted = res.data.map(slot => ({
          id: slot._id,
          bookedOn: slot.date? moment.tz(slot.date, AZ_TIMEZONE).format('YYYY-MM-DD') : '-',
          startTime: slot.startTime,
          endTime: slot.endTime || '-',
        }));

        setAppointments(formatted);
      } catch (err) {
        console.error('Failed to fetch my appointments:', err);
      }
    };

    fetchMyAppointments();
  }, [user]);

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


  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={3}>
      <Toolbar>
        <Typography variant="h6">My Appointments</Typography>
      </Toolbar>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Booked On</TableCell>
              <TableCell>Booking Start</TableCell>
              <TableCell>Booking End</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length === 0 ? (
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
                    <TableCell>{appt.startTime}</TableCell>
                    <TableCell>{appt.endTime}</TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" onClick={()=>handleCancel(appt.id)}>
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[10, 30, 50]}
          component="div"
          count={appointments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default MyAppointments;
