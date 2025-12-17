import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, TablePagination, Button
} from '@mui/material';
import axios from 'axios';

const FrozenUsers = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const DEFAULT_API=process.env.REACT_APP_API_URL||"";


  const fetchFreezedUsers=()=>{
    axios.get(`${DEFAULT_API}/api/users/freezed`)
    .then(res=>setUsers(res.data))
    .catch(err=>console.log('Error fetching frozen users:', err))
  }

  useEffect(() => {
    fetchFreezedUsers();
  }, []);

  const unfreezUser=async(id)=>{
    await axios.put(`${DEFAULT_API}/api/users/unfreez/${id}`);
    fetchFreezedUsers();

  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Frozen Users</Typography>
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
                <Button variant="outlined" size="small" color="error" onClick={()=>unfreezUser(user._id)}>UNFREEZE</Button>
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

export default FrozenUsers;