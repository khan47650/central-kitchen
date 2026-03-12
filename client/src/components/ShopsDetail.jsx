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
import { useParams, useNavigate, useLocation } from "react-router-dom";
import HoverZoomImage from "./HoverZoomImage";
import uiColors from "../Styles/uiColors";

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const STATUS_OPTIONS = {
  IN_STOCK: { label: "In Stock", color: "green" },
  OUT_OF_STOCK: { label: "Out of Stock", color: "red" },
};

const ShopsDetail = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const shopName = location.state?.shopName || "Shop";

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
    <Box p={{ xs: 2, md: 3   }} sx={{background:uiColors.background, minHeight: "100vh"}}>
      {/* TOP BAR */}
      <Box sx={{ mb: 3 }}>
        <Grid container alignItems="center">
          <Grid item xs={2}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBack sx={{ color: uiColors.text.primary }} />
            </IconButton>
          </Grid>
          <Grid item xs={8}>
            <Typography textAlign="center" fontWeight="bold" variant="h6" sx={{ color: uiColors.teal }}>
              {shopName}
            </Typography>
            <Typography sx={{ py: 1,color: uiColors.text.secondary }} textAlign="center" variant="body2">
              Menu Items
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* LOADING */}
      {loading &&
        [...Array(3)].map((_, i) => (
          <Card key={i} sx={{ mb: 2 ,bgcolor: uiColors.card, color: uiColors.text.primary  }}>
            <CardContent>
              <Skeleton width="40%" height={28} sx={{ bgcolor: uiColors.skeleton }} />
              <Skeleton width="25%" height={20} sx={{ bgcolor: uiColors.skeleton }} />
              <Divider sx={{ my: 1 }} />
              <Skeleton variant="rectangular" height={40} sx={{ bgcolor: uiColors.skeleton }} />
            </CardContent>
          </Card>
        ))}

      {/* EMPTY */}
      {!loading && categories.length === 0 && (
        <Typography textAlign="center" sx={{ color:uiColors.text.primary }}>No Menus found</Typography>
      )}


      {!loading &&
        categories.map((category) => {
          const isOpen = openCard === category._id;

          return (
            <Card key={category._id} sx={{ mb: 2 ,bgcolor: uiColors.card, color: uiColors.text.primary  }}>
              <CardContent>
                <Grid container alignItems="center">
                  <Grid item xs={8} sm={6}>
                    <Typography fontWeight="bold" sx={{color:uiColors.text.primary}}>
                      {category.categoryName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: uiColors.text.secondary }}>
                      {category.items.length} items in this category
                    </Typography>
                  </Grid>


                  {isDesktop && (
                    <>
                      <Grid item sm={2}>
                        {isOpen && (
                          <Typography fontWeight="bold" textAlign="right" sx={{color:uiColors.text.primary}}>
                            Price
                          </Typography>
                        )}
                      </Grid>
                      <Grid item sm={2}>
                        {isOpen && (
                          <Typography fontWeight="bold" textAlign="right" sx={{ pr: 3,color:uiColors.text.primary }}>
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
                        <KeyboardArrowDown sx={{color:uiColors.text.primary}} />
                      ) : (
                        <KeyboardArrowRight sx={{color:uiColors.text.primary}} />
                      )}
                    </IconButton>
                  </Grid>
                </Grid>


                {isOpen && (
                  <>
                    <Divider sx={{ my: 1 }} />

                    {category.items.length === 0 && (
                      <Typography
                        textAlign="center"
                        sx={{ py: 2,color:uiColors.text.primary }}
                      >
                        No items found
                      </Typography>
                    )}

                    {category.items.map((item, index) => (
                      <React.Fragment key={item._id}>
                        <Grid container spacing={2} alignItems="center" py={1}>

                          <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <HoverZoomImage
                                src={item.image}
                                size={34}
                                zoomSize={200}
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
