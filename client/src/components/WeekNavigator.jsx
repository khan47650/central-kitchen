import React from 'react';
import { Box, Button, colors } from '@mui/material';
import moment from 'moment-timezone';
import uiColors from '../Styles/uiColors';

const AZ_TIMEZONE = 'America/Phoenix';

const WeekNavigator = ({ selectedWeek, setSelectedWeek }) => {
  const startOfWeek = moment.tz(selectedWeek, AZ_TIMEZONE).startOf('week').add(1, 'day'); // Monday
  const endOfWeek = moment(startOfWeek).add(6, 'days'); // Sunday

  const handlePrev = () => setSelectedWeek(moment.tz(selectedWeek, AZ_TIMEZONE).subtract(7, 'days').toDate());
  const handleNext = () => setSelectedWeek(moment.tz(selectedWeek, AZ_TIMEZONE).add(7, 'days').toDate());

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Button sx={{color:uiColors.teal}} onClick={handlePrev}>← Previous</Button>
      <Box sx={{color:uiColors.text.primary}} >
        {startOfWeek.format('MMM D')} - {endOfWeek.format('MMM D, YYYY')}
      </Box>
      <Button sx={{color:uiColors.teal}} onClick={handleNext}>Next →</Button>
    </Box>
  );
};

export default WeekNavigator;