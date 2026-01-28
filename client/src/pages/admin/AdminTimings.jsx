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
    useMediaQuery,
    Skeleton,
    CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import moment from 'moment-timezone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';


const TIME_OPTIONS = Array.from({ length: 15 }, (_, i) => {
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
const isSameTime = (a, b) => a && b && a === b;

const AdminTimings = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const navigate = useNavigate();

    const fileInputRef = useRef(null);
    const activeShopIndex = useRef(null);

    const fetchShops = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${DEFAULT_API}/api/shops/all`);
            const formatted = res.data.map(shop => {
                const normalizedTimings = DAYS.map(day => {
                    const foundRaw = shop.timings?.find(t => unwrapTiming(t).day === day);
                    const found = unwrapTiming(foundRaw);
                    if (!found) return { day, open: false, openTime: '', closeTime: '', break: false, breakStart: '', breakEnd: '' };
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

    useEffect(() => { fetchShops(); }, []);

    const updateTiming = (shopIndex, dayIndex, field, value) => {
        const copy = [...shops];
        copy[shopIndex].timings[dayIndex] = {
            ...copy[shopIndex].timings[dayIndex],
            [field]: value
        };
        copy[shopIndex].dirty = true;
        setShops(copy);
    };

    const triggerImagePicker = (index) => {
        activeShopIndex.current = index;
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const copy = [...shops];
        copy[activeShopIndex.current].shopImage = URL.createObjectURL(file); // preview
        copy[activeShopIndex.current].newFile = file; // actual file for backend
        copy[activeShopIndex.current].dirty = true;
        setShops(copy);
    };

    const saveSettings = async (shop) => {
        try {
            setSavingId(shop._id);

            const formData = new FormData();
            formData.append('timings', JSON.stringify(shop.timings));
            if (shop.newFile) formData.append('shopImage', shop.newFile);

            await axios.put(`${DEFAULT_API}/api/shops/update/${shop._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            fetchShops();
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
            setShops(prev => prev.filter(shop => shop._id !== id));
        } catch (err) {
            console.error("Delete failed", err);
        } finally {
            setDeleteLoading(false);
        }
    };

    const getShopStatus = (timings) => {
        const now = moment.tz(AZ_TIMEZONE);
        const day = DAYS[now.day() === 0 ? 6 : now.day() - 1];
        const today = timings.find(t => t.day === day);
        if (!today) return 'Closed';
        const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
        const nowMin = now.hour() * 60 + now.minute();
        if (today.break && today.breakStart && today.breakEnd && nowMin >= toMin(today.breakStart) && nowMin <= toMin(today.breakEnd)) return 'Break';
        if (today.open && today.openTime && today.closeTime && nowMin >= toMin(today.openTime) && nowMin <= toMin(today.closeTime)) return 'Open';
        return 'Closed';
    };

    if (loading) {
        return <Box p={2}>{[...Array(2)].map((_, i) => <Skeleton key={i} height={250} sx={{ mb: 2, borderRadius: 2 }} />)}</Box>;
    }

    return (

        <Box p={isMobile ? 1 : 3}>
            {/* TOP HEADER */}
            <Box
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}
            >
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>

                <Typography variant={isMobile ? 'h6' : 'h5'}>
                    Timings
                </Typography>
            </Box>

            <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageChange} />

            {shops.length === 0 && <Typography align="center" color="text.secondary">No shops found</Typography>}

            {shops.map((shop, shopIndex) => (
                <Paper key={shop._id} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Box position="relative">
                            <Box component="img" src={shop.shopImage} sx={{ width: 70, height: 70, borderRadius: '50%' }} />
                            <EditIcon onClick={() => triggerImagePicker(shopIndex)}
                                sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: '#fff', borderRadius: '50%', p: 0.5, fontSize: 18, cursor: 'pointer' }} />
                        </Box>

                        <Box flexGrow={1}>
                            <Typography fontWeight={600}>{shop.shopName}</Typography>
                            <Typography variant="body2" color="text.secondary">{shop.address}</Typography>
                            <Typography variant="caption" sx={{
                                color: getShopStatus(shop.timings) === 'Open' ? 'green' :
                                    getShopStatus(shop.timings) === 'Break' ? 'orange' : 'red',
                                fontWeight: 600
                            }}>
                                {getShopStatus(shop.timings)}
                            </Typography>
                        </Box>

                        <Button variant="outlined" size="small" onClick={() => deleteShop(shop._id)}>
                            {deleteLoading ? <CircularProgress size={18} /> : "DELETE"}
                        </Button>
                    </Box>

                    <Typography fontWeight={600} mb={1}>Timings</Typography>
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Day</TableCell>
                                    <TableCell>Open</TableCell>
                                    <TableCell>Open Time</TableCell>
                                    <TableCell>Close Time</TableCell>
                                    <TableCell>Break</TableCell>
                                    <TableCell>Break Start</TableCell>
                                    <TableCell>Break End</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {shop.timings.map((row, dayIndex) => (
                                    <TableRow key={row.day}>
                                        <TableCell>{row.day}</TableCell>
                                        <TableCell>
                                            <Checkbox checked={row.open}
                                                onChange={e => updateTiming(shopIndex, dayIndex, 'open', e.target.checked)} />
                                        </TableCell>
                                        <TableCell>
                                            <Select size="small" value={row.openTime}
                                                onChange={e => {
                                                    if (isSameTime(e.target.value, row.closeTime)) return;
                                                    updateTiming(shopIndex, dayIndex, 'openTime', e.target.value)
                                                }}>
                                                {TIME_OPTIONS.map(t =>
                                                    <MenuItem key={t.value} value={t.value}>
                                                        {t.label}
                                                    </MenuItem>
                                                )}
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Select size="small" value={row.closeTime}
                                                onChange={e => {
                                                    if (isSameTime(e.target.value, row.openTime)) return;
                                                    updateTiming(shopIndex, dayIndex, 'closeTime', e.target.value)
                                                }}>
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
                                            <Checkbox checked={row.break}
                                                onChange={e => updateTiming(shopIndex, dayIndex, 'break', e.target.checked)} />
                                        </TableCell>
                                        <TableCell>
                                            <Select size="small" value={row.breakStart}
                                                onChange={e => {
                                                    if (isSameTime(e.target.value, row.breakEnd)) return;
                                                    updateTiming(shopIndex, dayIndex, 'breakStart', e.target.value)
                                                }}>
                                                {TIME_OPTIONS.map(t =>
                                                    <MenuItem key={t.value} value={t.value}>
                                                        {t.label}
                                                    </MenuItem>
                                                )}
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Select size="small" value={row.breakEnd}
                                                onChange={e => {
                                                    if (isSameTime(e.target.value, row.breakStart)) return;
                                                    updateTiming(shopIndex, dayIndex, 'breakEnd', e.target.value)
                                                }}>
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
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Button variant="contained" color="warning" sx={{ mt: 2 }} disabled={!shop.dirty || savingId === shop._id} onClick={() => saveSettings(shop)}>
                        {savingId === shop._id ? <CircularProgress size={18} /> : 'Save Settings'}
                    </Button>
                </Paper>
            ))}
        </Box>
    );
};

export default AdminTimings;
