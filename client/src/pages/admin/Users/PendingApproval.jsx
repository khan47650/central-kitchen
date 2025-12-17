import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, TablePagination, Button
} from '@mui/material';
import axios from 'axios';
import { CircularProgress } from "@mui/material";


const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const PendingApproval = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loadingId, setLoadingId] = useState(null);


  const fetchPendingUsers = () => {
    axios.get(`${DEFAULT_API}/api/users/pending`)
      .then(res => setUsers(res.data))
      .catch(err => console.error('Error fetching users:', err));
  };

  useEffect(() => {
    console.log('PendingApproval mounted');
    fetchPendingUsers();

  }, []);

  const approveUser = async (id) => {
    setLoadingId(id);
    try {
      await axios.put(`${DEFAULT_API}/api/users/approved/${id}`);
      fetchPendingUsers();
    } catch (err) {
      console.error(err);
    }
    setLoadingId(null);

  };

  const rejectUser = async (id) => {
    await axios.put(`${DEFAULT_API}/api/users/reject/${id}`);
    fetchPendingUsers();
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Pending Approval</Typography>
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
                <Button
                  style={{ marginRight: 8 }}
                  variant="outlined"
                  size="small"
                  onClick={() => approveUser(user._id)}
                  disabled={loadingId === user._id}
                >
                  {loadingId === user._id ? (
                    <CircularProgress size={18} />
                  ) : (
                    "APPROVE"
                  )}
                </Button>
                <Button onClick={() => rejectUser(user._id)} style={{ marginLeft: 2 }} variant="outlined" size="small" >REJECT</Button>
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

export default PendingApproval;