import React, { useEffect, useState } from "react";
import "../CSS/Shops.css";
import ShopsTopbar from "../components/ShopsTopbar";
import axios from "axios";
import moment from "moment-timezone";
import { Skeleton } from "@mui/material";

const DEFAULT_API = process.env.REACT_APP_API_URL || "";
const AZ_TIMEZONE = "America/Phoenix";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Shops = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchShops = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${DEFAULT_API}/api/shops/all`);
            setShops(res.data || []);
        } catch (error) {
            console.error("Failed to fetch shops:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, []);

    const getTodayStatus = (timings) => {
  const now = moment.tz(AZ_TIMEZONE);
  const today = DAYS[now.day()];
  const todayTiming = timings?.find(t => t.day === today);

  if (!todayTiming || !todayTiming.open) {
    return { status: "closed" };
  }

  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const nowMin = now.hours() * 60 + now.minutes();

  let status = "closed";
  if (
    todayTiming.break &&
    todayTiming.breakStart &&
    todayTiming.breakEnd &&
    nowMin >= toMinutes(todayTiming.breakStart) &&
    nowMin <= toMinutes(todayTiming.breakEnd)
  ) {
    status = "break";
  }
  else if (
    todayTiming.openTime &&
    todayTiming.closeTime &&
    nowMin >= toMinutes(todayTiming.openTime) &&
    nowMin <= toMinutes(todayTiming.closeTime)
  ) {
    status = "open";
  }
  return {
    status,
    openTime: todayTiming.openTime || "",
    closeTime: todayTiming.closeTime || "",
    breakStart: todayTiming.break ? todayTiming.breakStart : "",
    breakEnd: todayTiming.break ? todayTiming.breakEnd : ""
  };
};


    return (
        <div className="page-wrapper">
            <ShopsTopbar />

            <div className="page-content">
                <div className="shops-container">
                    {loading &&
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="shop-card">
                                <Skeleton variant="rectangular" height={160} />
                                <Skeleton variant="text" height={30} sx={{ mt: 1 }} />
                                <Skeleton variant="text" width="60%" />
                            </div>
                        ))}

                    {!loading &&
                        shops.map((shop) => {
                            const todayInfo = getTodayStatus(shop.timings);

                            return (
                                <div key={shop._id} className="shop-card">
                                    <img src={shop.shopImage} alt={shop.shopName} />

                                    <h5 className="shop-name">{shop.shopName}</h5>

                                    <p className={`status ${todayInfo.status.toLowerCase()}`}>
                                        {todayInfo.status}
                                    </p>

                                    <div className="timings-section">
                                        {todayInfo.openTime && todayInfo.closeTime ? (
                                            <>
                                                <p className="timing-label">Today Opening:</p>
                                                <p className="timing">
                                                    {todayInfo.openTime} - {todayInfo.closeTime}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="timing closed">No timings available</p>
                                        )}

                                        {todayInfo.breakStart && todayInfo.breakEnd && (
                                            <p className="break-timing">
                                                Break Time: {todayInfo.breakStart} - {todayInfo.breakEnd}
                                            </p>
                                        )}

                                    </div>
                                </div>
                            );
                        })}

                    {!loading && !shops.length && (
                        <p className="no-shops">No shops found</p>
                    )}
                </div>
            </div>

            <footer id="footer" className="footer dark-background">
                <div className="container text-center mt-4">
                    <p>© Central Kitchen — All Rights Reserved</p>
                    <div className="credits">
                        Designed by <a href="">LumenAi</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Shops;
