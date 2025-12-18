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
  Skeleton
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import moment from 'moment-timezone';

const AZ_TIMEZONE = 'America/Phoenix';

const ClientAppointments = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);


  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);

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
              userName = foundUser ? foundUser.fullName : "User";
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

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          All Appointments
        </Typography>
      </Toolbar>

      <Box p={3}>
        <TableContainer component={Paper}>
          <Table>
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
          <TableCell>{appt.startTime}</TableCell>
          <TableCell>{appt.endTime}</TableCell>
          <TableCell>
            <Button variant="outlined" size="small">
              View
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
    </Box>
  );
};

export default ClientAppointments;
