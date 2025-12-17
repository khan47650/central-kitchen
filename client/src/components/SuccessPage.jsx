import React, { useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import "../CSS/SuccessPage.css";
import { replace, useNavigate } from "react-router-dom";


const SuccessPage = () => {

    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login', { replace: true });

        }, 2000);

        return () => clearTimeout(timer);

    }, []);

    return (
        <div className="success-wrapper">
            <div className="success_card">
                {/* <FaArrowLeft className="back_icon" /> */}

                <div className="content_area">
                    <h1 className="success_text">Registered Successfully!</h1>
                    <p className="sub-text">We will send you an email once you are approved by admin.</p>
                </div>
            </div>
        </div>
    )
};


export default SuccessPage;

