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
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  ArrowBack,
} from "@mui/icons-material";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const STATUS_OPTIONS = {
  IN_STOCK: { label: "In Stock", color: "green" },
  OUT_OF_STOCK: { label: "Out of Stock", color: "red" },
};

const ShopsDetail = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = !isMobile && !isTablet;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCard, setOpenCard] = useState(null);
  const [addingCart, setAddingCart] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${DEFAULT_API}/api/categories/all/${shopId}`
      );
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (id) => {
    setAddingCart(id);
    setTimeout(() => setAddingCart(null), 800);
  };

  useEffect(() => {
    if (shopId) fetchCategories();
  }, [shopId]);

  return (
    <Box p={{ xs: 2, md: 3 }}>
      {/* TOP BAR */}
      <Box sx={{ mb: 3 }}>
        <Grid container alignItems="center">
          <Grid item xs={2}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBack />
            </IconButton>
          </Grid>
          <Grid item xs={8}>
            <Typography textAlign="center" fontWeight="bold" variant="h6">
              Categories
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* LOADING */}
      {loading &&
        [...Array(3)].map((_, i) => (
          <Card key={i} sx={{ mb: 2 }}>
            <CardContent>
              <Skeleton width="40%" height={28} />
              <Skeleton width="25%" height={20} />
              <Divider sx={{ my: 1 }} />
              <Skeleton variant="rectangular" height={40} />
            </CardContent>
          </Card>
        ))}

      {/* EMPTY */}
      {!loading && categories.length === 0 && (
        <Typography textAlign="center">No categories found</Typography>
      )}

  
      {!loading &&
        categories.map((category) => {
          const isOpen = openCard === category._id;

          return (
            <Card key={category._id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container alignItems="center">
                  <Grid item xs={8} sm={6}>
                    <Typography fontWeight="bold">
                      {category.categoryName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.items.length} items in this category
                    </Typography>
                  </Grid>


                  {isDesktop && (
                    <>
                      <Grid item sm={2}>
                        {isOpen && (
                          <Typography fontWeight="bold" textAlign="right">
                            Price
                          </Typography>
                        )}
                      </Grid>
                      <Grid item sm={2}>
                        {isOpen && (
                          <Typography fontWeight="bold" textAlign="right" sx={{pr:3}}>
                            Status
                          </Typography>
                        )}
                      </Grid>
                    </>
                  )}

                  <Grid
                    item
                    xs={4}
                    sm={2}
                    display="flex"
                    justifyContent="flex-end"
                  >
                    <IconButton
                      onClick={() =>
                        setOpenCard(isOpen ? null : category._id)
                      }
                    >
                      {isOpen ? (
                        <KeyboardArrowDown />
                      ) : (
                        <KeyboardArrowRight />
                      )}
                    </IconButton>
                  </Grid>
                </Grid>

              
                {isOpen && (
                  <>
                    <Divider sx={{ my: 1 }} />

                    {category.items.map((item, index) => (
                      <React.Fragment key={item._id}>
                        <Grid container spacing={2} alignItems="center" py={1}>
                    
                          <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar
                                variant="rounded"
                                src={item.image || ""}
                                sx={{ width: 36, height: 36 }}
                              />
                              <Typography>{item.name}</Typography>
                            </Box>
                          </Grid>

                      
                          <Grid item xs={6} sm={2}>
                            <Typography
                              textAlign={isDesktop ? "right" : "left"}
                            >
                              ${item.price}
                            </Typography>
                          </Grid>

                      
                          <Grid item xs={6} sm={2}>
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1}
                              justifyContent={
                                isDesktop ? "flex-end" : "flex-start"
                              }
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  bgcolor:
                                    STATUS_OPTIONS[item.itemStatus]?.color ||
                                    "gray",
                                }}
                              />
                              <Typography variant="body2">
                                {
                                  STATUS_OPTIONS[item.itemStatus]?.label ||
                                  "Unknown"
                                }
                              </Typography>
                            </Box>
                          </Grid>

                      
                          {/* <Grid item xs={12} sm={2}>
                            <Box
                              display="flex"
                              justifyContent={
                                isDesktop ? "flex-end" : "stretch"
                              }
                            >
                              <Button
                                fullWidth={!isDesktop}
                                size="small"
                                variant="outlined"
                                disabled={addingCart === item._id}
                                onClick={() => handleAddToCart(item._id)}
                                sx={{
                                  minWidth: isDesktop ? 130 : "100%",
                                }}
                              >
                                {addingCart === item._id ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  "Add to Cart"
                                )}
                              </Button>
                            </Box>
                          </Grid> */}
                        </Grid>

                        {index !== category.items.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
    </Box>
  );
};

export default ShopsDetail;
