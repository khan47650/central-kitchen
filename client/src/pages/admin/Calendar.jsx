import React, { useState, useContext, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import CalendarGrid from '../../components/CalendarGrid';
import BookSlotModal from '../../components/BookSlotModal';
import { AuthContext } from '../../context/AuthContext';
import WeekNavigator from '../../components/WeekNavigator';
import axios from 'axios';

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const Calendar = () => {
  const { user } = useContext(AuthContext);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [users, setUsers] = useState({}); // map userId -> fullName
  const [openModal, setOpenModal] = useState(false);

  // Fetch all slots
  const fetchSlots = async () => {
    try {
      const res = await axios.get(`${DEFAULT_API}/api/slots`);
      setSlots(res.data);
    } catch (err) { console.error(err); }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${DEFAULT_API}/api/users/all`);
      const userMap = {};
      res.data.forEach(u => { userMap[u._id] = u.fullName; });
      setUsers(userMap);
    } catch (err) { console.error('Error fetching users:', err); }
  };

  useEffect(() => {
    fetchSlots();
    fetchUsers();
  }, []);

  const handleSlotBooked = (newSlot) => {
    setSlots(prev => [...prev, newSlot]);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Hello, {user?.role?.toUpperCase()}</Typography>

        <Box display="flex" gap={2}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setOpenModal(true)}
          >
            Book Slot
          </Button>

          <Button
            variant="outlined"
            color="error"
            disabled={user.role !== 'admin'}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Week Navigator */}
      <WeekNavigator selectedWeek={selectedWeek} setSelectedWeek={setSelectedWeek} />
      {/* Calendar Grid */}
      <CalendarGrid selectedWeek={selectedWeek} slots={slots} users={users} />

      {/* Booking Modal */}
      <BookSlotModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        userId={user._id}
        isAdmin={user.role === 'admin'}
        onBooked={handleSlotBooked}
      />
    </Box>
  );
};

export default Calendar;
