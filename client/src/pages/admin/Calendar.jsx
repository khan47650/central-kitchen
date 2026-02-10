import React, { useState, useContext, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import CalendarGrid from '../../components/CalendarGrid';
import BookSlotModal from '../../components/BookSlotModal';
import { AuthContext } from '../../context/AuthContext';
import WeekNavigator from '../../components/WeekNavigator';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import AdminUnavailableSlotModal from '../../components/AdminUnavailableSlotModel';

const DEFAULT_API = process.env.REACT_APP_API_URL || "";
const TOPBAR_HEIGHT = 64;

const Calendar = () => {
  const { user } = useContext(AuthContext);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [users, setUsers] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [openUnavailableModal, setOpenUnavailableModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();


  const fetchSlots = async () => {
    try {
      const res = await axios.get(`${DEFAULT_API}/api/slots`);
      setSlots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${DEFAULT_API}/api/users/all`);
      const map = {};
      res.data.forEach(u => {
        map[u._id] = {
          fullName: u.fullName,
          businessName: u.businessName,
        };
      });
      setUsers(map);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleEmptyCellClick = ({ date, startTime }) => {
    setSelectedSlot({ date, startTime });
    setOpenModal(true);

  }

  const handleBookedCellClick = (slot) => {
    if (user.role === 'admin') {
      setSlotToDelete(slot);
      setDeleteDialogOpen(true);
      return;
    }
    if (slot.bookedBy === user._id) {
      setSlotToDelete(slot);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDeleteSlot = async () => {
    try {
      setDeleting(true);
      await axios.delete(`${DEFAULT_API}/api/slots/delete/${slotToDelete._id}`);

      setSlots(prev =>
        prev.filter(s => s._id !== slotToDelete._id)
      );

      setDeleteDialogOpen(false);
      setSlotToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };



  useEffect(() => {
    fetchSlots();
    fetchUsers();
  }, []);

  const handleSlotBooked = (newSlot) => {
    setSlots(prev => [...prev, newSlot]);
  };

  return (
    <Box
      sx={{
        width: '100%',
        pt: { xs: `${TOPBAR_HEIGHT + 8}px`, md: 2 },
      }}
    >
      {/* ===== HEADER ===== */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <Box sx={{
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={700}>
            Hello, {user?.role === 'admin' ? 'Admin' : user?.fullName || 'Client'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>

          {user?.role === 'admin' && (
            <Button variant="outlined" color="error" onClick={() => setOpenUnavailableModal(true)}>
              Make Unavailable Slot
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => setOpenModal(true)}
            sx={{ color: "white" }}
          >
            Book Slot
          </Button>
          {/* 
          <Button
            variant="outlined"
            color="error"
            disabled={user?.role !== 'admin'}
          >
            Delete
          </Button> */}
        </Box>
      </Box>

      {/* ===== WEEK NAVIGATOR ===== */}
      <Box sx={{ mb: 2 }}>
        <WeekNavigator
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
        />
      </Box>

      {/* ===== CALENDAR GRID ===== */}
      <Box
        sx={{
          width: '100%',
          overflowX: 'auto',
          pb: 2,
        }}
      >
        <CalendarGrid
          selectedWeek={selectedWeek}
          slots={slots}
          users={users}
          onEmptyCellClick={handleEmptyCellClick}
          onBookedCellClick={handleBookedCellClick}
        />
      </Box>

      {/* ===== BOOK SLOT MODAL ===== */}
      <BookSlotModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        userId={user._id}
        isAdmin={user.role === 'admin'}
        onBooked={handleSlotBooked}
        slots={slots}
      />

      <AdminUnavailableSlotModal
        open={openUnavailableModal}
        onClose={() => setOpenUnavailableModal(false)}
        onBooked={handleSlotBooked}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Slot</DialogTitle>

        <DialogContent>
          <Typography>
            Do you want to delete this slot?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            No
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={confirmDeleteSlot}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Yes"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Calendar;
