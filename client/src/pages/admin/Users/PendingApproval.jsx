import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, TablePagination, Button,
  IconButton
} from '@mui/material';
import axios from 'axios';
import { CircularProgress } from "@mui/material";
import { Skeleton } from "@mui/material";
import { useTheme, useMediaQuery, TableContainer } from '@mui/material';
import UserDetailsDialog from '../../../components/UserDetailsDialog';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import uiColors from '../../../Styles/uiColors';




const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const PendingApproval = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loadingId, setLoadingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();




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
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
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
          <ArrowBackIcon sx={{ color: uiColors.text.primary }} />
        </IconButton>
        <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ color: uiColors.text.primary }}>
          Pending Approval
        </Typography>
      </Box>


      <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', bgcolor: uiColors.card, borderRadius: 1 }}>
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: uiColors.text.primary }}>Name</TableCell>
              <TableCell sx={{ color: uiColors.text.primary }}>Email</TableCell>
              <TableCell sx={{ color: uiColors.text.primary }}>Role</TableCell>
              <TableCell sx={{ color: uiColors.text.primary }}>Status</TableCell>
              <TableCell sx={{ color: uiColors.text.primary }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/*LOADING STATE */}
            {loading && (
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton width="80%" sx={{
                    bgcolor: uiColors.skeleton.baseColor,
                    "&::after": { bgcolor: uiColors.skeleton.highlightColor }
                  }} /></TableCell>
                  <TableCell><Skeleton width="90%" sx={{
                    bgcolor: uiColors.skeleton.baseColor,
                    "&::after": { bgcolor: uiColors.skeleton.highlightColor }
                  }} /></TableCell>
                  <TableCell><Skeleton width="60%" sx={{
                    bgcolor: uiColors.skeleton.baseColor,
                    "&::after": { bgcolor: uiColors.skeleton.highlightColor }
                  }} /></TableCell>
                  <TableCell><Skeleton width="50%" sx={{
                    bgcolor: uiColors.skeleton.baseColor,
                    "&::after": { bgcolor: uiColors.skeleton.highlightColor }
                  }} /></TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Skeleton variant="rounded" width={80} height={30} sx={{
                        bgcolor: uiColors.skeleton.baseColor,
                        "&::after": { bgcolor: uiColors.skeleton.highlightColor }
                      }} />
                      <Skeleton variant="rounded" width={70} height={30} sx={{
                        bgcolor: uiColors.skeleton.baseColor,
                        "&::after": { bgcolor: uiColors.skeleton.highlightColor }
                      }} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}

            {/*EMPTY STATE */}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography sx={{ py: 3, color: uiColors.text.primary }}>
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
                  <TableCell sx={{ color: uiColors.text.primary }}>{user.fullName}</TableCell>
                  <TableCell sx={{ color: uiColors.text.primary }}>{user.email}</TableCell>
                  <TableCell sx={{ color: uiColors.text.primary }}>{user.role}</TableCell>
                  <TableCell sx={{ color: uiColors.text.primary }}>{user.status}</TableCell>
                  <TableCell>
                    <Box
                      display="flex"
                      gap={1}
                      flexWrap="nowrap"     
                      justifyContent="flex-start" 
                    >
                      <Button
                        sx={{
                          minWidth: isMobile ? 60 : 80, background: uiColors.gradient,
                          color: "white",
                          "&:hover": {
                            background: uiColors.gradientHover,
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
                          }
                        }}
                        size="small"
                        onClick={() => approveUser(user._id)}
                        disabled={loadingId === user._id}
                      >
                        {loadingId === user._id ? <CircularProgress size={18} sx={{ color: uiColors.text.primary }} /> : (isMobile ? "APPROVE" : "APPROVE")}
                      </Button>

                      <Button
                        sx={{
                          minWidth: isMobile ? 60 : 80, background: uiColors.gradient,
                          color: "white",
                          "&:hover": {
                            background: uiColors.gradientHover,
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
                          }
                        }}
                        size="small"
                        onClick={() => rejectUser(user._id)}
                      >
                        {isMobile ? "REJECT" : "REJECT"}
                      </Button>

                      <Button
                        size="small"
                        sx={{
                          minWidth: isMobile ? 50 : 80, background: uiColors.gradient,
                          color: "white",
                          "&:hover": {
                            background: uiColors.gradientHover,
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
                          }
                        }}
                        onClick={() => handleViewUser(user)}
                      >
                        VIEW
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
        sx={{
          color: "white",
          "& .MuiTablePagination-actions .MuiIconButton-root": {
            color: "white"
          },
          "& .MuiSelect-select, & .MuiInputBase-root, & .MuiTablePagination-displayedRows": {
            color: "white"
          },
          "& .MuiTablePagination-selectIcon": {
            color: "white"
          }
        }}
      />

      <UserDetailsDialog
        open={openDialog}
        onClose={handleCloseDialog}
        user={selectedUser}
      />
    </Box>
  );
};

export default PendingApproval;