import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ShowNotifications from "../helper/ShowNotifications";
import LoginApi from "../Api/LoginApi";

const ForgotPinLayer = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Mobile, 2: OTP
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [error, setError] = useState("");

    const otpRefs = useRef([]);

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 3) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");

        if (!phoneNumber.trim()) {
            setError("Please Enter Your Phone Number");
            return;
        }
        if (phoneNumber.length !== 10) {
            setError("Please enter a valid 10-digit phone number");
            return;
        }

        setLoading(true);
        const result = await LoginApi.requestOtp(phoneNumber);
        setLoading(false);
        if (result.status) {
            setStep(2);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpValue = otp.join("");
        if (otpValue.length !== 4) {
            ShowNotifications.showAlertNotification("Please enter the complete 4-digit OTP", false);
            return;
        }
        setLoading(true);
        const result = await LoginApi.verifyOtp({ phoneNumber, otp: otpValue });
        setLoading(false);
        if (result.status) {
            navigate("/reset-pin", { state: { phoneNumber, otp: otpValue } });
        }
    };

    return (
        <section className="auth min-vh-100 d-flex justify-content-center align-items-center bg-primary-600">
            <style>
                {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .forgot-card {
            animation: fadeInUp 0.6s ease-out;
          }
        `}
            </style>

            <div
                className="forgot-card bg-white radius-16 p-32 p-sm-40 shadow-lg text-center mx-3"
                style={{ maxWidth: "450px", width: "100%" }}
            >
                <div className="mb-32">
                    <Link to="/" className="d-inline-block mb-32 mt-16 text-center w-100">
                        <img
                            src="assets/images/logo1.png"
                            alt="Logo"
                            style={{ maxWidth: "250px", width: "100%", height: "auto", objectFit: "contain" }}
                        />
                    </Link>
                    <h4 className="mb-12 fw-bold text-dark">
                        {step === 1 ? "Forgot PIN" : "Verify OTP"}
                    </h4>
                    <p className="text-secondary-light text-md">
                        {step === 1
                            ? "Enter your registered mobile number to receive OTP"
                            : `Enter the 4-digit OTP sent to ${phoneNumber}`}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSendOtp}>
                        <div className="icon-field mb-32 text-start">
                            <label className="form-label text-secondary text-sm fw-medium mb-8">
                                Phone Number
                            </label>
                            <div className="position-relative">
                                <span className="icon top-50 translate-middle-y start-0 ms-3 text-secondary-light">
                                    <Icon icon="mage:phone" className="text-xl" />
                                </span>
                                <input
                                    type="tel"
                                    className={`form-control h-56-px bg-neutral-50 radius-12 ps-5 ${error ? "border border-danger" : ""}`}
                                    placeholder="Enter Phone Number"
                                    value={phoneNumber}
                                    onChange={(e) => {
                                        setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
                                        setError("");
                                    }}
                                    maxLength={10}
                                />
                            </div>
                            {error && (
                                <span className="text-danger text-xs mt-1 d-block">
                                    {error}
                                </span>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-100 radius-12 h-56-px fw-semibold"
                            disabled={loading}
                        >
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </button>
                        <div className="mt-24 text-center">
                            <Link to="/sign-in" className="text-primary-600 fw-bold mt-24">
                                Back to Sign In
                            </Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="mb-32">
                            <label className="form-label text-secondary text-sm fw-medium mb-12 d-block text-start">
                                OTP Verification
                            </label>
                            <div className="d-flex gap-8 justify-content-between">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (otpRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        className="form-control h-48-px bg-neutral-50 radius-12 text-center text-lg fw-bold border-2 focus-border-primary p-0"
                                        style={{ width: "80px" }}
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                    />
                                ))}
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-100 radius-12 h-56-px fw-semibold"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                        <div className="mt-24">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="btn btn-link text-primary-600 fw-semibold text-sm p-0 border-0"
                            >
                                Change Phone Number
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
};

export default ForgotPinLayer;
