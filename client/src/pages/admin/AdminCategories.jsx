import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Grid,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  CircularProgress,
  Skeleton,
  Button
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowRight, Edit, Delete } from "@mui/icons-material";
import AddEditItemDialog from "../../components/AddEditItemDialog";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";


const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const AdminCategories = () => {
  const { user } = useAuth();
  const { shopId } = useParams();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCard, setOpenCard] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [editItemData, setEditItemData] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const STATUS_OPTIONS = {
    IN_STOCK: { label: "In Stock", color: "green" },
    OUT_OF_STOCK: { label: "Out of Stock", color: "red" },
  };

  const fetchCategories = async () => {
    setLoading(true);
    console.log("shopId:", shopId);
    try {
      const res = await axios.get(
        `${DEFAULT_API}/api/categories/all/${shopId}`
      );
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Fetch categories failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      setDeletingId(categoryId);
      await axios.delete(`${DEFAULT_API}/api/categories/delete/${categoryId}`);
      setCategories((prev) => prev.filter((c) => c._id !== categoryId));
    } catch (err) {
      console.error("Delete category failed", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteItem = async (categoryId, itemId) => {
    try {
      setDeletingId(itemId);
      await axios.delete(
        `${DEFAULT_API}/api/categories/deleteItem/${categoryId}/${itemId}`
      );
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id !== categoryId
            ? cat
            : { ...cat, items: cat.items.filter((i) => i._id !== itemId) }
        )
      );
    } catch (err) {
      console.error("Delete item failed", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (categoryId, itemId, newStatus) => {
    try {
      setUpdatingStatus(itemId);
      await axios.put(
        `${DEFAULT_API}/api/categories/updateItemStatus/${categoryId}/${itemId}`,
        { itemStatus: newStatus }
      );
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id !== categoryId
            ? cat
            : {
              ...cat,
              items: cat.items.map((it) =>
                it._id === itemId ? { ...it, itemStatus: newStatus } : it
              ),
            }
        )
      );
    } catch (err) {
      console.error("Update status failed", err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Box p={{ xs: 2, md: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <IconButton
          size="small"
          onClick={() => navigate(-1)}  
        >
          <ArrowBack />
        </IconButton>

        <Typography variant={isMobile ? "h6" : "h5"}>
          Edit Categories
        </Typography>
      </Box>


      {loading &&
        Array.from(new Array(3)).map((_, i) => (
          <Card key={i} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container alignItems="center">
                <Grid item xs={7}>
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Grid>
                <Grid item xs={5} textAlign="right">
                  <Skeleton variant="circular" width={32} height={32} />
                </Grid>
              </Grid>
              <Divider sx={{ my: 1 }} />
              {Array.from(new Array(2)).map((_, j) => (
                <Grid container alignItems="center" spacing={1} py={0.6} key={j}>
                  <Grid item xs={12} sm={7}>
                    <Skeleton variant="rectangular" width="100%" height={40} />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Skeleton variant="text" width="60%" height={28} />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Skeleton variant="text" width="60%" height={28} />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <Skeleton variant="circular" width={32} height={32} />
                  </Grid>
                </Grid>
              ))}
            </CardContent>
          </Card>
        ))}

      {/* No categories */}
      {!loading && categories.length === 0 && (
        <Typography textAlign="center" color="text.secondary" mt={4}>
          No categories found
        </Typography>
      )}

      {/* Categories */}
      {!loading &&
        categories.map((category) => {
          const isOpen = openCard === category._id;

          return (
            <Card key={category._id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container alignItems="center">
                  <Grid item xs={7} sm={7}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "15px",
                      }}
                    >
                      {category.categoryName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {category.items.length} items in this category
                    </Typography>

                  </Grid>

                  {!isMobile && !isTablet && (
                    <Grid item sm={2}>
                      {isOpen && (
                        <Typography fontWeight="bold" textAlign="right" sx={{ pr: 3 }}>
                          Price
                        </Typography>
                      )}
                    </Grid>
                  )}
                  {!isMobile && !isTablet && (
                    <Grid item sm={2}>
                      {isOpen && <Typography fontWeight="bold" textAlign="right">Status</Typography>}
                    </Grid>
                  )}

                  <Grid
                    item
                    xs={5}
                    sm={1}
                    display="flex"
                    justifyContent="flex-end"
                    alignItems="center"
                    gap={1}
                  >
                    {!isOpen && (
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={deletingId === category._id}
                        onClick={() => handleDeleteCategory(category._id)}
                        sx={{
                          minWidth: isMobile ? 70 : 80,
                          px: isMobile ? 1 : 1.5,
                          height: 32,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {deletingId === category._id ? (
                          <CircularProgress size={16} color="error" />
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    )}

                    <IconButton size="small" onClick={() => setOpenCard(isOpen ? null : category._id)}>
                      {isOpen ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                    </IconButton>
                  </Grid>
                </Grid>

                {isOpen && (
                  <>
                    <Divider sx={{ my: 1 }} />

                    {/* Tablet headings */}
                    {isTablet && (
                      <Grid container sx={{ mb: 1 }}>
                        <Grid item xs={6}>
                          <Typography fontWeight="bold">Price</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography fontWeight="bold">Status</Typography>
                        </Grid>
                      </Grid>
                    )}

                    {category.items.map((item, index) => (
                      <React.Fragment key={item._id}>
                        <Grid
                          container
                          alignItems={isMobile || isTablet ? "flex-start" : "center"}
                          spacing={isMobile || isTablet ? 1 : 0}
                          py={0.6}
                        >
                          <Grid item xs={12} sm={isTablet ? 6 : 7}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar variant="rounded" sx={{ width: 34, height: 34 }} src={item.image || ""} />
                              <Typography>{item.name}</Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={6} sm={isTablet ? 3 : 2} sx={{ pr: 4, mt: isMobile || isTablet ? 1 : 0 }}>
                            <Typography textAlign={isMobile || isTablet ? "left" : "right"}>
                              ${item.price}
                            </Typography>
                          </Grid>

                          <Grid item xs={6} sm={isTablet ? 3 : 2} sx={{ mt: isMobile || isTablet ? 1 : 0 }}>
                            <Select
                              size="small"
                              value={item.itemStatus}
                              disabled={updatingStatus === item._id}
                              sx={{
                                height: 32,
                                width: 150,
                                "& .MuiSelect-select": {
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                },
                              }}
                              renderValue={(value) => {
                                const option = STATUS_OPTIONS[value];
                                return (
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        bgcolor: option.color,
                                      }}
                                    />
                                    <Typography variant="body2">{option.label}</Typography>
                                  </Box>
                                );
                              }}
                              onChange={(e) => handleStatusChange(category._id, item._id, e.target.value)}
                            >
                              <MenuItem value="IN_STOCK">
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "green" }} />
                                  In Stock
                                </Box>
                              </MenuItem>
                              <MenuItem value="OUT_OF_STOCK">
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "red" }} />
                                  Out of Stock
                                </Box>
                              </MenuItem>
                            </Select>
                          </Grid>

                          <Grid item xs={12} sm={1} sx={{ mt: isMobile || isTablet ? 1 : 0 }} display="flex" justifyContent={isMobile || isTablet ? "flex-start" : "flex-end"} gap={1}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditItemData(item);
                                setActiveCategoryId(category._id);
                                setOpenItemDialog(true);
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              color="error"
                              disabled={deletingId === item._id}
                              onClick={() => handleDeleteItem(category._id, item._id)}
                            >
                              {deletingId === item._id ? <CircularProgress size={16} /> : <Delete fontSize="small" />}
                            </IconButton>
                          </Grid>
                        </Grid>

                        {index !== category.items.length - 1 && <Divider sx={{ ml: isMobile ? 0 : 6 }} />}
                      </React.Fragment>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}

      <AddEditItemDialog
        open={openItemDialog}
        onClose={() => setOpenItemDialog(false)}
        itemData={editItemData}
        categoryId={activeCategoryId}
        onSuccess={fetchCategories}
      />
    </Box>
  );
};

export default AdminCategories;
