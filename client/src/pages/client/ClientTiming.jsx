import React, { useEffect, useState } from 'react';
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
    useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import moment from 'moment-timezone';
import AddShopDialog from '../../components/AddShopDialog';

const AZ_TIMEZONE = 'America/Phoenix';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_OPTIONS = Array.from({ length: 15 }, (_, i) => `${6 + i}:00`);

const INITIAL_SHOPS = [
    {
        id: 1,
        createdBy: 'Admin',
        shopName: 'Central Kitchen',
        address: 'Phoenix, AZ',
        shopImage: 'https://i.pravatar.cc/150?img=1',
        timings: DAYS.map(d => ({
            day: d,
            open: false,
            openTime: '',
            closeTime: '',
            break: false,
            breakStart: '',
            breakEnd: ''
        })),
        dirty: false
    },
    {
        id: 2,
        createdBy: 'Admin',
        shopName: 'Desert Bites',
        address: 'Tempe, AZ',
        shopImage: 'https://i.pravatar.cc/150?img=2',
        timings: DAYS.map(d => ({
            day: d,
            open: false,
            openTime: '',
            closeTime: '',
            break: false,
            breakStart: '',
            breakEnd: ''
        })),
        dirty: false
    }
];

const ClientTimings = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [shops, setShops] = useState(INITIAL_SHOPS);
    const [openDialog, setOpenDialog] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const updateTiming = (shopIndex, dayIndex, field, value) => {
        const copy = [...shops];
        const row = copy[shopIndex].timings[dayIndex];

        if (field === 'break') {
            row.break = value;
            if (value) {
                row.open = false;
                row.openTime = '';
                row.closeTime = '';
            }
        }

        if (field === 'open') {
            row.open = value;
            if (value) {
                row.break = false;
                row.breakStart = '';
                row.breakEnd = '';
            }
        }

        row[field] = value;
        copy[shopIndex].dirty = true;
        setShops(copy);

    };

    useEffect(() => {
        const checkLock = () => {
            const nowAZ = moment().tz(AZ_TIMEZONE);

            const updatedShops = shops.map(shop => {
                const copyShop = { ...shop };
                copyShop.timings = copyShop.timings.map(row => {
                    const openHour = parseInt(row.openTime?.split(':')[0] || '0', 10);
                    const lockTime = moment.tz(AZ_TIMEZONE)
                        .hour(openHour)
                        .minute(0)
                        .subtract(2, 'hours'); 

                    const locked = row.openTime && nowAZ.isAfter(lockTime);
                    return { ...row, isLockedForEdit: locked };
                });
                return copyShop;
            });

            setShops(updatedShops);
        };

        checkLock();
        const interval = setInterval(checkLock, 60000); // update every minute
        return () => clearInterval(interval);
    }, [shops]);

    return (
        <Box p={isMobile ? 1 : 3}>
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant={isMobile ? 'h6' : 'h5'}>Client Timings</Typography>
                <Button
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        minWidth: isMobile ? 60 : 100,
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        '&:hover': {
                            backgroundColor: '#1976d2',
                        },
                    }}
                    variant="contained"
                    size="small"
                >
                    ADD
                </Button>

            </Box>



            {shops.map((shop, shopIndex) => (
                <Paper key={shop.id} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
                    {/* HEADER */}
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Box position="relative">
                            <Box
                                component="img"
                                src={shop.shopImage}
                                sx={{ width: 70, height: 70, borderRadius: '50%' }}
                            />

                            <input
                                type="file"
                                accept="image/*"
                                id={`upload-${shop.id}`}
                                style={{ display: 'none' }}
                                onChange={e => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            // Update shop image in state
                                            const copy = [...shops];
                                            copy[shopIndex].shopImage = reader.result;
                                            copy[shopIndex].dirty = true;
                                            setShops(copy);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />

                            <label htmlFor={`upload-${shop.id}`}>
                                <EditIcon
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        bgcolor: '#fff',
                                        borderRadius: '50%',
                                        p: 0.5,
                                        fontSize: 18,
                                        cursor: 'pointer'
                                    }}
                                />
                            </label>
                        </Box>


                        <Box display="flex" justifyContent="space-between" alignItems="center" flexGrow={1}>
                            <Box>
                                <Typography fontWeight={600}>{shop.shopName}</Typography>
                                <Typography variant="body2" color="text.secondary">{shop.address}</Typography>
                                <Typography variant="caption" color="green"> ● Open</Typography>

                            </Box>
                            <Button
                                sx={{ minWidth: isMobile ? 40 : 80 }}
                                variant="outlined" size="small">DELETE</Button>

                        </Box>

                    </Box>

                    {/* TIMINGS */}
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
                                            <Checkbox
                                                checked={row.open}
                                                disabled={row.break || row.isLockedForEdit}
                                                onChange={e =>
                                                    updateTiming(shopIndex, dayIndex, 'open', e.target.checked)
                                                }
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Select
                                                size="small"
                                                value={row.openTime}
                                                disabled={!row.open || row.isLockedForEdit}
                                                onChange={e =>
                                                    updateTiming(shopIndex, dayIndex, 'openTime', e.target.value)
                                                }
                                            >
                                                {TIME_OPTIONS.map(t => (
                                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                                ))}
                                            </Select>
                                        </TableCell>

                                        <TableCell>
                                            <Select
                                                size="small"
                                                value={row.closeTime}
                                                disabled={!row.open || row.isLockedForEdit}
                                                onChange={e =>
                                                    updateTiming(shopIndex, dayIndex, 'closeTime', e.target.value)
                                                }
                                            >
                                                {TIME_OPTIONS.map(t => (
                                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                                ))}
                                            </Select>
                                        </TableCell>

                                        <TableCell>
                                            <Checkbox
                                                checked={row.break}
                                                disabled={isLocked ||  row.isLockedForEdit}
                                                onChange={e =>
                                                    updateTiming(shopIndex, dayIndex, 'break', e.target.checked)
                                                }
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Select
                                                size="small"
                                                value={row.breakStart}
                                                disabled={!row.break || row.isLockedForEdit}
                                                onChange={e =>
                                                    updateTiming(shopIndex, dayIndex, 'breakStart', e.target.value)
                                                }
                                            >
                                                {TIME_OPTIONS.map(t => (
                                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                                ))}
                                            </Select>
                                        </TableCell>

                                        <TableCell>
                                            <Select
                                                size="small"
                                                value={row.breakEnd}
                                                disabled={!row.break || row.isLockedForEdit}
                                                onChange={e =>
                                                    updateTiming(shopIndex, dayIndex, 'breakEnd', e.target.value)
                                                }
                                            >
                                                {TIME_OPTIONS.map(t => (
                                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                                ))}
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Button
                        variant="contained"
                        color="warning"
                        sx={{ mt: 2 }}
                        disabled={!shop.dirty || isLocked}
                    >
                        Save Settings
                    </Button>

                    {isLocked && (
                        <Typography variant="caption" color="error" display="block" mt={1}>
                            Changes are not allowed after 6:00 PM
                        </Typography>
                    )}
                </Paper>
            ))}

            <AddShopDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)} />
        </Box>
    );
};

export default ClientTimings;
