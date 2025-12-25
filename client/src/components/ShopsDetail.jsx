import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "../CSS/ShopDetail.css";

const SHOP_DATA = {
  1: {
    name: "Central Kitchen",
    address: "Phoenix, AZ",
    description:
      "Central Kitchen is a fully equipped commissary kitchen designed for food entrepreneurs and caterers.",
    status: "Open",
    timing: "13:00 - 18:00",
    image: "https://i.pravatar.cc/300?img=11",
  },
  2: {
    name: "Desert Bites",
    address: "Tempe, AZ",
    description:
      "Desert Bites offers a modern kitchen space suitable for startups and cloud kitchens.",
    status: "Closed",
    timing: "—",
    image: "https://i.pravatar.cc/300?img=12",
  },
};

const ShopsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const shop = SHOP_DATA[id];

  if (!shop)
  return (
    <div className="page-wrapper-details">
      <div className="page-content-details">
        <div className="shop-not-found-card">
          <p>Shop not found</p>
        </div>
      </div>
    </div>
  );


  return (
    <div className="page-wrapper-details">
      <div className="page-content-details">
        <div className="shop-detail-card">
          {/* Back Arrow */}
          <div className="back-arrow" onClick={() => navigate(-1)}>
            <ArrowBackIcon fontSize="small" />
          </div>

          {/* Image */}
          <div className="shop-image-wrapper">
            <img src={shop.image} alt={shop.name} />
          </div>

          {/* Content */}
          <div className="shop-detail-content">
            <h2>{shop.name}</h2>
            <p className="address">{shop.address}</p>
            <p className="description">{shop.description}</p>

            <p className={`status ${shop.status.toLowerCase()}`}>
              Status: {shop.status}
            </p>

            <h5>Today Opening Time</h5>
            <p className="timing">{shop.timing}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopsDetail;
