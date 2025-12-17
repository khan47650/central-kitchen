import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Button
} from '@mui/material';
import moment from 'moment-timezone';

const AZ_TIMEZONE = 'America/Phoenix';


const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchUsersAndAppointments = async () => {
      try {
        // Fetch all users
        const usersRes = await axios.get(`${DEFAULT_API}/api/users/all`);
        const allUsers = usersRes.data;

        // Fetch all slots
        const slotsRes = await axios.get(`${DEFAULT_API}/api/slots`);
        const data = slotsRes.data.map(slot => {
          let userName = "Not booked";

          if (slot.bookedBy) {
            if (slot.bookedBy === "Admin") {
              userName = "Admin";
            } else if (typeof slot.bookedBy === "string") {
              // If it's a valid userId
              const foundUser = allUsers.find(u => u._id === slot.bookedBy);
              userName = foundUser ? foundUser.fullName : "User";
            } else if (typeof slot.bookedBy === "object") {
              // If backend returns populated user object
              userName = slot.bookedBy.fullName || "Unknown";
            }
          }

          return {
            id: slot._id,
            userName,
            bookedOn: slot.date ? moment.tz(slot.date, AZ_TIMEZONE).format('MM/DD/YYYY') : '-',

            bookingStart: slot.startTime,
            bookingEnd: slot.endTime || '-'
          };
        });

        // Sort by date + startTime for consistent order
        data.sort((a, b) => {
          const dateA = moment.tz(`${a.bookedOn} ${a.bookingStart}`, 'MM/DD/YYYY HH:mm', AZ_TIMEZONE);

          const dateB = moment.tz(`${b.bookedOn} ${b.bookingStart}`, 'MM/DD/YYYY HH:mm', AZ_TIMEZONE);

          return dateA - dateB;
        });

        setAppointments(data);
      } catch (err) {
        console.error('Failed to fetch users or appointments:', err);
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
    <>
      <h2 style={{ marginTop: 8, marginBottom: 16 }}>All Appointments</h2>
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
          {appointments
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map(row => (
              <TableRow key={row.id}>
                <TableCell>{row.userName}</TableCell>
                <TableCell>{row.bookedOn}</TableCell>
                <TableCell>{row.bookingStart}</TableCell>
                <TableCell>{row.bookingEnd}</TableCell>
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
    </>
  );
};

export default AllAppointments;
