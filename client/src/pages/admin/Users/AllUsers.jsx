import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Button
} from '@mui/material';
import axios from 'axios';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const DEFAULT_API=process.env.REACT_APP_API_URL||"";


const fetchAllUsers=()=>{
  axios.get(`${DEFAULT_API}/api/users/all`)
  .then(res=>setUsers(res.data))
  .catch(err=>console.error('Error fetching users:', err))

};

  useEffect(() => {
   fetchAllUsers();
  }, []);

  const freezUser=async(id)=>{
    await axios.put(`${DEFAULT_API}/api/users/freez/${id}`);
    fetchAllUsers();

  };

  const unfreezUser = async (id) => {
  await axios.put(`${DEFAULT_API}/api/users/unfreez/${id}`);
  fetchAllUsers();
};




  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        All Users
      </Typography>

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
          {users
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                      <Button variant="outlined" size="small">VIEW</Button>
                      <Button variant="outlined" size="small" onClick={
                        ()=>user.status==="freezed"?unfreezUser(user._id):freezUser(user._id)}>{user.status==="freezed"?"UNFREEZE":"FREEZE"}</Button>
                     </Box>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={users.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default AllUsers;