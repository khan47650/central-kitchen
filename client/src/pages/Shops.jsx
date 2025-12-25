import React from "react";
import "../CSS/Shops.css";
import ShopsTopbar from "../components/ShopsTopbar";


const Shops = () => {

    const SHOPS = [
        {
            id: 1,
            name: "Central Kitchen",
            image: "https://i.pravatar.cc/200?img=11",
            status: "Open",
            timing: "13:00 - 18:00",
            break_timing: "11:00 - 12:00"
        },
        {
            id: 2,
            name: "Desert Bites",
            image: "https://i.pravatar.cc/200?img=12",
            status: "Open",
            timing: "13:00 - 18:00",
            break_timing: "11:00 - 12:00"
        },
        {
            id: 3,
            name: "Phoenix Foods",
            image: "https://i.pravatar.cc/200?img=13",
            status: "Break",
            timing: "13:00 - 18:00",
            break_timing: "11:00 - 12:00"
        },
        {
            id: 4,
            name: "Central Kitchen",
            image: "https://i.pravatar.cc/200?img=11",
            status: "Close",
            timing: "13:00 - 18:00",
            break_timing: "11:00 - 12:00"
        },
        {
            id: 5,
            name: "Desert Bites",
            image: "https://i.pravatar.cc/200?img=12",
            status: "Break",
            timing: "13:00 - 18:00",
            break_timing: "11:00 - 12:00"
        },
        {
            id: 6,
            name: "Phoenix Foods",
            image: "https://i.pravatar.cc/200?img=13",
            status: "Open",
            timing: "13:00 - 18:00",
            break_timing: "11:00 - 12:00"
        },
    ];


    return (
        <div className="page-wrapper">
            <ShopsTopbar />
            <div className="page-content">
                <div className="shops-container">
                    {SHOPS.map((shop) => (
                        <div
                            key={shop.id}
                            className="shop-card"
                        >
                            <img src={shop.image} alt={shop.name} />
                            <h5 className="shop-name">{shop.name}</h5>
                            <p className={`status ${shop.status.toLowerCase()}`}>
                                {shop.status}
                            </p>
                            <div className="timings-section">
                                <p className="timing-label">Today Opening:</p>
                                <p className="timing">{shop.timing}</p>
                                {shop.status.toLowerCase() === "break" && (
                                    <p className="break-timing">
                                        Break Time: {shop.break_timing}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
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