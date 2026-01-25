import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
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
  Skeleton,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowRight, Add, Edit, Delete } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import AddCategoryDialog from "../../components/AddCategoryDialog";
import AddEditItemDialog from "../../components/AddEditItemDialog";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import HoverZoomImage from "../../components/HoverZoomImage";

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const MyCategories = () => {
  const [openCard, setOpenCard] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [hasShop, setHasShop] = useState(false);





  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [editItemData, setEditItemData] = useState(null);

  const STATUS_OPTIONS = {
    in: { label: "In Stock", color: "green" },
    out: { label: "Out of Stock", color: "red" },
  };

  const fetchShopStatus = async () => {
    const res = await axios.get(`${DEFAULT_API}/api/shops/my/${user._id}`);
    setHasShop(res.data.length > 0);
  };
  const fetchCategories = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${DEFAULT_API}/api/categories/user/${user._id}`);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      setDeletingId(categoryId);
      await axios.delete(
        `${DEFAULT_API}/api/categories/delete/${categoryId}`
      );
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
      await axios.delete(`${DEFAULT_API}/api/categories/deleteItem/${categoryId}/${itemId}`);

      setCategories((prevCategories) =>
        prevCategories.map((cat) => {
          if (cat._id !== categoryId) return cat;
          return {
            ...cat,
            items: cat.items.filter((it) => it._id !== itemId),
          };
        })
      );
    } catch (err) {
      console.error("Delete item failed", err);
      // toast.error(err?.response?.data?.message || "Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };



  useEffect(() => {
    if (user?._id) {
      fetchShopStatus();
      fetchCategories();
    }
  }, [user?._id]);

  const handleStatusChange = async (categoryId, itemId, newStatus) => {
    try {
      setUpdatingStatus(itemId);
      await axios.put(`${DEFAULT_API}/api/categories/updateItemStatus/${categoryId}/${itemId}`, {
        itemStatus: newStatus,
      });

      setCategories((prevCategories) =>
        prevCategories.map((cat) => {
          if (cat._id !== categoryId) return cat;
          return {
            ...cat,
            items: cat.items.map((it) => {
              if (it._id !== itemId) return it;
              return { ...it, itemStatus: newStatus };
            }),
          };
        })
      );
    } catch (err) {
      console.error("Update item status error:", err);
      alert(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };



  return (
    <Box p={{ xs: 2, md: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        flexDirection={isMobile ? "column" : "row"}
        gap={2}
        mb={3}
      >
        <Typography variant={isMobile ? "h6" : "h5"}>My Categories</Typography>
        {hasShop && (
          <Button
            variant="contained"
            startIcon={<Add />}
            fullWidth={isMobile}
            sx={{ color: "white" }}
            onClick={() => setOpenDialog(true)}
          >
            Add Category
          </Button>
        )}
      </Box>

      {loading &&
        (Array.from(new Array(3)).map((_, i) => (
          <Card key={i} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container alignItems="center">
                <Grid item xs={7} sm={7}>
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Grid>
                <Grid item xs={5} sm={5} textAlign="right">
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
        )))}

      {!loading && categories.length === 0 && (
        <Typography
          textAlign="center"
          color="text.secondary"
          mt={4}
        >
          No categories found
        </Typography>
      )}
      {!loading && categories.map((category) => {
        const isOpen = openCard === category._id;

        return (
          <Card key={category._id} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container alignItems="center">
                <Grid item xs={7} sm={7}>
                  <Typography fontWeight="bold">{category.categoryName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.items.length} items in this category
                  </Typography>
                </Grid>

                {!isMobile && !isTablet && (
                  <Grid item sm={2}>
                    {isOpen && (
                      <Typography fontWeight="bold" textAlign="right" sx={{ pr: 2 }}>
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
                  alignItems="center"
                  justifyContent="flex-end"
                  gap={1}
                  sx={{
                    flexWrap: "nowrap",
                  }}
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

                  <IconButton
                    size="small"
                    onClick={() => setOpenCard(isOpen ? null : category._id)}
                  >
                    {isOpen ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                  </IconButton>
                </Grid>


              </Grid>

              {isOpen && (
                <>
                  <Divider sx={{ my: 1 }} />

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
                    <React.Fragment key={item.id}>
                      <Grid
                        container
                        alignItems={isMobile || isTablet ? "flex-start" : "center"}
                        spacing={isMobile || isTablet ? 1 : 0}
                        py={0.6}
                      >
                        <Grid item xs={12} sm={isTablet ? 6 : 7}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <HoverZoomImage
                              src={item.image}
                              size={34}
                              zoomSize={200}
                            />


                            <Typography>{item.name}</Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={6} sm={isTablet ? 3 : 2} sx={{ mt: isMobile || isTablet ? 1 : 0 }}>
                          <Typography textAlign={isMobile || isTablet ? "left" : "right"} sx={{ pr: isTablet ? 0 : 3 }}>
                            ${item.price}
                          </Typography>
                        </Grid>

                        <Grid
                          item
                          xs={6}
                          sm={isTablet ? 3 : 2}
                          sx={{ mt: isMobile || isTablet ? 1 : 0 }}
                          display="flex"
                          justifyContent={isMobile || isTablet ? "flex-start" : "flex-end"}
                        >
                          <Select
                            size="small"
                            value={item.itemStatus} // DB se aaya hua value
                            disabled={updatingStatus === item._id} // progress ke waqt disable
                            sx={{
                              height: 32,
                              width: 150,
                              "& .MuiSelect-select": {
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                paddingRight: "44px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              },
                              "& .MuiSelect-icon": {
                                right: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                              },
                            }}
                            renderValue={(value) => {
                              if (updatingStatus === item._id) {
                                return <CircularProgress size={18} />;
                              }
                              const option = value === "IN_STOCK" ? STATUS_OPTIONS.in : STATUS_OPTIONS.out;
                              return (
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      bgcolor: option.color,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Typography variant="body2" noWrap>
                                    {option.label}
                                  </Typography>
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

                        <Grid
                          item
                          xs={12}
                          sm={isTablet ? 12 : 1}
                          sx={{ mt: isMobile || isTablet ? 1 : 0 }}
                          display="flex"
                          justifyContent={isMobile || isTablet ? "flex-start" : "flex-end"}
                          gap={1}
                        >
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

                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    mt={1.5}
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      setEditItemData(null);
                      setActiveCategoryId(category._id);
                      setOpenItemDialog(true);
                    }}
                  >
                    <Add color="primary" />
                    <Typography color="primary">Add Item</Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}

      <AddCategoryDialog
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        handleCreate={(newCategory) => {
          fetchCategories();
        }}
      />
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

export default MyCategories;
