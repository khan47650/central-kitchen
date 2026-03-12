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
import uiColors from '../../../Styles/uiColors';



const FrozenUsers = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();


  const DEFAULT_API = process.env.REACT_APP_API_URL || "";


  const fetchFreezedUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${DEFAULT_API}/api/users/freezed`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching frozen users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreezedUsers();
  }, []);

  const unfreezUser = async (id) => {
    await axios.put(`${DEFAULT_API}/api/users/unfreez/${id}`);
    fetchFreezedUsers();

  }

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
        <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ color: uiColors.text.primary }} >
          Frozen Users
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
            {loading &&
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
                    <Skeleton variant="rounded" width={90} height={30} sx={{
                      bgcolor: uiColors.skeleton.baseColor,
                      "&::after": { bgcolor: uiColors.skeleton.highlightColor }
                    }} />
                  </TableCell>
                </TableRow>
              ))}

            {/* EMPTY STATE */}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography sx={{ py: 3, color: uiColors.text.primary }}>
                    No frozen users
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
                    <TableCell sx={{ color: uiColors.text.primary }}>{user.fullName}</TableCell>
                    <TableCell sx={{ color: uiColors.text.primary }}>{user.email}</TableCell>
                    <TableCell sx={{ color: uiColors.text.primary }}>{user.role}</TableCell>
                    <TableCell sx={{ color: uiColors.text.primary }}>{user.status}</TableCell>
                    <TableCell sx={{ color: uiColors.text.primary }}>
                      <Button
                        size="small"
                        color="error"
                        sx={{
                          minWidth: isMobile ? 60 : 90, background: uiColors.gradient,
                          color: "white",
                          "&:hover": {
                            background: uiColors.gradientHover,
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
                          }
                        }}
                        onClick={() => unfreezUser(user._id)}
                      >
                        {isMobile ? "UNFREEZE" : "UNFREEZE"}
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
    </Box>
  );
};

export default FrozenUsers;