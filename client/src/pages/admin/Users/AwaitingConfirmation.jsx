import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, TablePagination, Button
} from '@mui/material';
import axios from 'axios';

const AwaitingConfirmation = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const DEFAULT_API=process.env.REACT_APP_API_URL||"";


  const fetchAwaitingUsers=()=>{
    axios.get(`${DEFAULT_API}/api/users/awaiting`)
    .then(res=>setUsers(res.data))
    .catch(err=>console.error('Error fetching awaiting users:', err));

  };

  useEffect(() => {
    fetchAwaitingUsers();
  }, []);

    const confirmUser = async (id) => {
      console.log("confirm called");
    await axios.put(`${DEFAULT_API}/api/users/approved/${id}`);
    fetchAwaitingUsers();
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Awaiting Confirmation</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
            <TableRow key={index}>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>
                <Button variant="outlined" size="small" onClick={()=>confirmUser(user._id)}>CONFIRM</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={users.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Box>
  );
};

export default AwaitingConfirmation;