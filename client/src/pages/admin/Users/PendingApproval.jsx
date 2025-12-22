import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, TablePagination, Button
} from '@mui/material';
import axios from 'axios';
import { CircularProgress } from "@mui/material";
import { Skeleton } from "@mui/material";
import { useTheme, useMediaQuery, TableContainer } from '@mui/material';




const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const PendingApproval = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loadingId, setLoadingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));




  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${DEFAULT_API}/api/users/pending`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
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
      <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
        Pending Approval
      </Typography>

      <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table size={isMobile ? 'small' : 'medium'}>
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
            {/*LOADING STATE */}
            {loading && (
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton width="80%" /></TableCell>
                  <TableCell><Skeleton width="90%" /></TableCell>
                  <TableCell><Skeleton width="60%" /></TableCell>
                  <TableCell><Skeleton width="50%" /></TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Skeleton variant="rounded" width={80} height={30} />
                      <Skeleton variant="rounded" width={70} height={30} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}

            {/*EMPTY STATE */}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No pending users
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {/*DATA STATE */}
            {!loading && users
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    <Box
                      display="flex"
                      gap={1}
                      flexWrap="nowrap"      // <- add this
                      justifyContent="flex-start" // optional, left align
                    >
                      <Button
                        sx={{ minWidth: isMobile ? 60 : 80 }}
                        variant="outlined"
                        size="small"
                        onClick={() => approveUser(user._id)}
                        disabled={loadingId === user._id}
                      >
                        {loadingId === user._id ? <CircularProgress size={18} /> : (isMobile ? "APPROVE" : "APPROVE")}
                      </Button>

                      <Button
                        sx={{ minWidth: isMobile ? 60 : 80 }}
                        variant="outlined"
                        size="small"
                        onClick={() => rejectUser(user._id)}
                      >
                        {isMobile ? "REJECT" : "REJECT"}
                      </Button>
                    </Box>
                  </TableCell>

                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
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