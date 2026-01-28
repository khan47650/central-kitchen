import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, TablePagination, Button,
  IconButton
} from '@mui/material';
import axios from 'axios';
import { Skeleton } from "@mui/material";
import { useTheme, useMediaQuery, TableContainer } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';



const AwaitingConfirmation = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();



  const DEFAULT_API = process.env.REACT_APP_API_URL || "";


  const fetchAwaitingUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${DEFAULT_API}/api/users/awaiting`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching awaiting users:', err);
    } finally {
      setLoading(false);
    }
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
      <Box sx={{
        mb: 3,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant={isMobile ? 'h6' : 'h5'}>
          Awaiting Confirmation
        </Typography>
      </Box>
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
            {/* LOADING STATE */}
            {loading &&
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton width="80%" /></TableCell>
                  <TableCell><Skeleton width="90%" /></TableCell>
                  <TableCell><Skeleton width="60%" /></TableCell>
                  <TableCell><Skeleton width="50%" /></TableCell>
                  <TableCell>
                    <Skeleton variant="rounded" width={90} height={30} />
                  </TableCell>
                </TableRow>
              ))}

            {/* EMPTY STATE */}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No awaiting users
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {/*DATA STATE */}
            {!loading &&
              users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: isMobile ? 60 : 90 }}
                        onClick={() => confirmUser(user._id)}
                      >
                        {isMobile ? "CONFIRM" : "CONFIRM"}
                      </Button>

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

export default AwaitingConfirmation;