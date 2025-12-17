import React from 'react';
import { Box, Button } from '@mui/material';
import moment from 'moment';

const WeekNavigator = ({ selectedWeek, setSelectedWeek }) => {
  const startOfWeek = moment(selectedWeek).startOf('week').add(1, 'day'); // Monday
  const endOfWeek = moment(startOfWeek).add(3, 'days');

  const handlePrev = () => setSelectedWeek(moment(selectedWeek).subtract(7, 'days').toDate());
  const handleNext = () => setSelectedWeek(moment(selectedWeek).add(7, 'days').toDate());

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Button onClick={handlePrev}>← Previous</Button>
      <Box>
        {startOfWeek.format('MMM D')} - {endOfWeek.format('MMM D, YYYY')}
      </Box>
      <Button onClick={handleNext}>Next →</Button>
    </Box>
  );
};

export default WeekNavigator;