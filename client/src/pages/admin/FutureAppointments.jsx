import React, { useState, useEffect } from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Typography, Box,
  Button
} from '@mui/material';
import moment from 'moment-timezone';
import axios from 'axios';

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const AZ_TIMEZONE = 'America/Phoenix';


const FutureAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [users, setUsers] = useState([]);

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
              userName = foundUser ? foundUser.fullName : "User";
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

      } catch (err) {
        console.error('Error fetching users or appointments:', err);
      }
    };

    fetchUsersAndAppointments();
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Future Appointments
      </Typography>

      <Table>
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
          {appointments
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((slot, index) => (
              <TableRow key={index}>
                <TableCell>{slot.userName || '-'}</TableCell>
                <TableCell>{slot.date}</TableCell>
                <TableCell>{slot.startTime}</TableCell>
                <TableCell>{slot.endTime}</TableCell>
                <TableCell>
                  <Button variant="contained" size="small">VIEW DETAILS</Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={appointments.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default FutureAppointments;
