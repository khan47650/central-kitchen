import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Button,
  Checkbox,
  Select,
  MenuItem,
  Skeleton,
  useMediaQuery,
  CircularProgress,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from "@mui/icons-material/Add";
import AddShopDialog from '../../components/AddShopDialog';
import { useAuth } from "../../context/AuthContext";
import axios from 'axios';
import moment from 'moment-timezone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import uiColors from '../../Styles/uiColors';
import { darkSelectStyle, darkSelectMenuProps } from '../../Styles/uiSelectStyle';


const TIME_OPTIONS = Array.from({ length: 17 }, (_, i) => {
  const hour = 6 + i;
  return {
    value: `${hour.toString().padStart(2, "0")}:00`, // 24h (DB)
    label: moment(`${hour}:00`, "H:mm").format("hh:mm A") // UI
  };
});

const DEFAULT_API = process.env.REACT_APP_API_URL || "";
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const AZ_TIMEZONE = 'America/Phoenix';

const unwrapTiming = (t) => (t?._doc ? t._doc : t);

const formatTime = (time) => time || '';
const ClientTimings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const activeShopIndex = useRef(null);

  const isSameTime = (a, b) => a && b && a === b;

  const fetchShops = async (isAfterSave = false) => {
    if (!user?._id) return;
    try {
      if (isAfterSave) {
        setLoading(false);
      } else {
        setLoading(true);
      }
      const res = await axios.get(`${DEFAULT_API}/api/shops/my/${user._id}`);

      const formatted = res.data.map(shop => {
        const normalizedTimings = DAYS.map(day => {
          const foundRaw = shop.timings?.find(t => unwrapTiming(t).day === day);
          const found = unwrapTiming(foundRaw);

          if (!found) {
            return {
              day,
              open: false,
              openTime: '',
              closeTime: '',
              break: false,
              breakStart: '',
              breakEnd: ''
            };
          }

          return {
            day,
            open: Boolean(found.open),
            openTime: formatTime(found.openTime),
            closeTime: formatTime(found.closeTime),
            break: Boolean(found.break),
            breakStart: formatTime(found.breakStart),
            breakEnd: formatTime(found.breakEnd)
          };
        });

        return { ...shop, timings: normalizedTimings, dirty: false };
      });

      setShops(formatted);
    } catch (err) {
      console.error("Fetch shops failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops(false);
  }, [user]);

  const updateTiming = (shopIndex, dayIndex, field, value) => {
    const copy = [...shops];
    copy[shopIndex].timings[dayIndex] = {
      ...copy[shopIndex].timings[dayIndex],
      [field]: value
    };
    copy[shopIndex].dirty = true;
    setShops(copy);
  };

  const isEditLocked = (row) => {
    //if no timings for current day -NO LOCK
    if (!row.open || !row.openTime || !row.closeTime) return false;

    const now = moment.tz(AZ_TIMEZONE);
    const todayName = DAYS[now.day() === 0 ? 6 : now.day() - 1];

    //current day lock
    if (row.day !== todayName) return false;

    const [h, m = 0] = row.openTime.split(':').map(Number);

    const openMoment = moment
      .tz(AZ_TIMEZONE)
      .hour(h)
      .minute(m)
      .second(0);

    // 2 hours before open time
    const lockTime = openMoment.clone().subtract(2, 'hours');

    return now.isSameOrAfter(lockTime);
  };


  const getShopStatus = (timings) => {
    const now = moment.tz(AZ_TIMEZONE);
    const todayName = DAYS[now.day() === 0 ? 6 : now.day() - 1];
    const today = timings.find(t => t.day === todayName);
    if (!today) return 'Closed';

    const toMin = t => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const nowMin = now.hours() * 60 + now.minutes();

    if (
      today.break &&
      today.breakStart &&
      today.breakEnd &&
      nowMin >= toMin(today.breakStart) &&
      nowMin <= toMin(today.breakEnd)
    ) return 'Break';

    if (
      today.open &&
      today.openTime &&
      today.closeTime &&
      nowMin >= toMin(today.openTime) &&
      nowMin <= toMin(today.closeTime)
    ) return 'Open';

    return 'Closed';
  };

  const triggerImagePicker = (index) => {
    activeShopIndex.current = index;
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const copy = [...shops];
    copy[activeShopIndex.current].shopImage = URL.createObjectURL(file);
    copy[activeShopIndex.current].newFile = file;
    copy[activeShopIndex.current].dirty = true;
    setShops(copy);
  };


  const saveSettings = async (shop) => {
    try {
      setSavingId(shop._id);

      const formData = new FormData();
      formData.append('shopId', shop._id);
      formData.append('timings', JSON.stringify(shop.timings));
      if (shop.newFile) {
        formData.append('shopImage', shop.newFile);
      }

      await axios.put(`${DEFAULT_API}/api/shops/update/${shop._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      fetchShops(true);
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSavingId(null);
    }
  };


  const deleteShop = async (id) => {
    try {
      setDeleteLoading(true);
      await axios.delete(`${DEFAULT_API}/api/shops/delete/${id}`);
      setShops(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box p={isMobile ? 1 : 3}>
      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageChange}
      />

      <Box display="flex" justifyContent="space-between" mb={2}>
        <Box
          sx={{
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon sx={{ color: uiColors.text.primary }} />
          </IconButton>
          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ color: uiColors.text.primary }}>
            Manage Shop
          </Typography>
        </Box>

        {!loading && shops.length === 0 && (
          <Button
            onClick={() => setOpenDialog(true)}
            variant="contained"
            startIcon={<AddIcon sx={{ color: uiColors.text.primary }} />}
            sx={{
              color: "#fff",
              px: { xs: 1.5, sm: 3 },
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              height: { xs: 32, sm: 36 },
              background: uiColors.gradient,
              "&:hover": {
                background: uiColors.gradientHover,
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
              }
            }}
          >
            ADD
          </Button>
        )}
      </Box>

      {loading && [...Array(2)].map((_, i) => (
        <Skeleton key={i} height={200} sx={{ mb: 2, borderRadius: 2, bgcolor: uiColors.skeleton.baseColor }} />
      ))}

      {!loading && !shops.length && (
        <Typography align="center" sx={{ color: uiColors.text.primary }}>No shops found</Typography>
      )}

      {shops.map((shop, shopIndex) => (
        <Paper key={shop._id} sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: uiColors.card }}>
          <Box display="flex" gap={2} mb={2}>
            <Box position="relative">
              <Box
                component="img"
                src={shop.shopImage}
                sx={{ width: 70, height: 70, borderRadius: '50%' }}
              />
              <EditIcon
                onClick={() => triggerImagePicker(shopIndex)}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: '#fff',
                  borderRadius: '50%',
                  p: 0.5,
                  cursor: 'pointer'
                }}
              />
            </Box>

            <Box flexGrow={1}>
              <Typography fontWeight={400} sx={{ color: uiColors.text.primary }} >{shop.shopName}</Typography>
              <Typography variant="body2" sx={{ color: uiColors.text.secondary }}> {shop.address} </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: getShopStatus(shop.timings) === 'Open'
                    ? 'green'
                    : getShopStatus(shop.timings) === 'Break'
                      ? 'orange'
                      : 'red',
                  fontWeight: 600
                }}
              >
                {getShopStatus(shop.timings)}
              </Typography>

            </Box>

            <Button
              size={isMobile ? "small" : "medium"}
              onClick={() => deleteShop(shop._id)}
              sx={{
                minWidth: isMobile ? 70 : 100,
                height: isMobile ? 32 : 36,
                px: isMobile ? 1 : 2,
                fontSize: isMobile ? "0.7rem" : "0.85rem",
                whiteSpace: "nowrap",
                color: "white",
                background: uiColors.gradient,
                "&:hover": {
                  background: uiColors.gradientHover,
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(17,203,226,0.4)"
                }
              }}
            >
              {deleteLoading ? (
                <CircularProgress size={16} sx={{ color: uiColors.text.primary }} />
              ) : (
                "DELETE"
              )}
            </Button>

          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: uiColors.text.primary }}>Day</TableCell>
                  <TableCell sx={{ color: uiColors.text.primary }}>Open</TableCell>
                  <TableCell sx={{ color: uiColors.text.primary }}>Open Time</TableCell>
                  <TableCell sx={{ color: uiColors.text.primary }}>Close Time</TableCell>
                  <TableCell sx={{ color: uiColors.text.primary }}>Break</TableCell>
                  <TableCell sx={{ color: uiColors.text.primary }}>Break Start</TableCell>
                  <TableCell sx={{ color: uiColors.text.primary }}>Break End</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {shop.timings.map((row, dayIndex) => {
                  const locked = isEditLocked(row);

                  return (
                    <TableRow key={row.day}>
                      <TableCell sx={{ color: uiColors.text.primary }}>{row.day}</TableCell>

                      <TableCell>
                        <Checkbox
                          checked={row.open}
                          disabled={locked}
                          onChange={e =>
                            updateTiming(shopIndex, dayIndex, 'open', e.target.checked)
                          }
                          sx={{
                            color: uiColors.text.primary,
                            "&.Mui-checked": {
                              color: uiColors.teal
                            }
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Select
                          size="small"
                          value={row.openTime}
                          disabled={!row.open || locked}
                          onChange={e => {
                            if (isSameTime(e.target.value, row.closeTime)) return;
                            updateTiming(shopIndex, dayIndex, 'openTime', e.target.value)
                          }}
                          sx={darkSelectStyle}
                          MenuProps={darkSelectMenuProps}
                        >
                          {TIME_OPTIONS.map(t =>
                            <MenuItem key={t.value} value={t.value}>
                              {t.label}
                            </MenuItem>
                          )}

                        </Select>
                      </TableCell>

                      <TableCell>
                        <Select
                          size="small"
                          value={row.closeTime}
                          disabled={!row.open || locked}
                          sx={darkSelectStyle}
                          MenuProps={darkSelectMenuProps}
                          onChange={e => {
                            if (isSameTime(e.target.value, row.openTime)) return;
                            updateTiming(shopIndex, dayIndex, 'closeTime', e.target.value)
                          }}
                        >
                          {TIME_OPTIONS
                            .filter(t =>
                              !row.openTime ||
                              parseInt(t.value.split(':')[0]) >
                              parseInt(row.openTime.split(':')[0])
                            )
                            .map(t => (
                              <MenuItem key={t.value} value={t.value}>
                                {t.label}
                              </MenuItem>
                            ))
                          }

                        </Select>
                      </TableCell>

                      <TableCell>
                        <Checkbox
                          checked={row.break}
                          disabled={locked}
                          sx={{
                            color: uiColors.text.primary,
                            "&.Mui-checked": {
                              color: uiColors.teal
                            }
                          }}
                          onChange={e =>
                            updateTiming(shopIndex, dayIndex, 'break', e.target.checked)
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Select
                          size="small"
                          value={row.breakStart}
                          disabled={!row.break || locked}
                          sx={darkSelectStyle}
                          MenuProps={darkSelectMenuProps}
                          onChange={e => {
                            if (isSameTime(e.target.value, row.breakEnd)) return;
                            updateTiming(shopIndex, dayIndex, 'breakStart', e.target.value)
                          }}
                        >
                          {TIME_OPTIONS.map(t =>
                            <MenuItem key={t.value} value={t.value}>
                              {t.label}
                            </MenuItem>
                          )}
                        </Select>
                      </TableCell>

                      <TableCell>
                        <Select
                          size="small"
                          value={row.breakEnd}
                          disabled={!row.break || locked}
                          sx={darkSelectStyle}
                          MenuProps={darkSelectMenuProps}
                          onChange={e => {
                            if (isSameTime(e.target.value, row.breakStart)) return;
                            updateTiming(shopIndex, dayIndex, 'breakEnd', e.target.value)
                          }}
                        >
                          {TIME_OPTIONS
                            .filter(t =>
                              !row.breakStart ||
                              parseInt(t.value.split(':')[0]) >
                              parseInt(row.breakStart.split(':')[0])
                            )
                            .map(t => (
                              <MenuItem key={t.value} value={t.value}>
                                {t.label}
                              </MenuItem>
                            ))
                          }

                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            variant="contained"
            color="warning"
            sx={{
              mt: 2,
              color: "white",
              background: shop.dirty && savingId !== shop._id ? uiColors.gradient : "grey", // active vs disabled
              "&:hover": {
                background: shop.dirty && savingId !== shop._id ? uiColors.gradientHover : "grey",
                transform: shop.dirty && savingId !== shop._id ? "translateY(-2px)" : "none",
                boxShadow: shop.dirty && savingId !== shop._id ? "0 6px 20px rgba(17,203,226,0.4)" : "none",
              },
            }}
            disabled={!shop.dirty || savingId === shop._id}
            onClick={() => saveSettings(shop)}
          >
            {savingId === shop._id ? <CircularProgress size={18} sx={{color:uiColors.text.primary}} /> : 'Save Settings'}
          </Button>
        </Paper>
      ))}

      <AddShopDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSuccess={() => {
          setOpenDialog(false);
          fetchShops();
        }}
      />
    </Box>
  );
};

export default ClientTimings;
