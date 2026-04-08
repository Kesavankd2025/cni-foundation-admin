import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import LoginApi from "../Api/LoginApi";

const ResetPinLayer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const phoneNumber = location.state?.phoneNumber || "";

    const [newPin, setNewPin] = useState(["", "", "", ""]);
    const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
    const [showPin, setShowPin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ newPin: "", confirmPin: "" });

    const newPinRefs = useRef([]);
    const confirmPinRefs = useRef([]);

    const handlePinChange = (index, value, pinType) => {
        if (isNaN(value)) return;
        if (pinType === "new") {
            const updated = [...newPin];
            updated[index] = value;
            setNewPin(updated);
            if (value && index < 3) newPinRefs.current[index + 1].focus();
        } else {
            const updated = [...confirmPin];
            updated[index] = value;
            setConfirmPin(updated);
            if (value && index < 3) confirmPinRefs.current[index + 1].focus();
        }
        setErrors({ ...errors, [pinType + "Pin"]: "" });
    };

    const handleKeyDown = (index, e, pinType) => {
        const pin = pinType === "new" ? newPin : confirmPin;
        const refs = pinType === "new" ? newPinRefs : confirmPinRefs;
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            refs.current[index - 1].focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const pinVal = newPin.join("");
        const confirmVal = confirmPin.join("");
        const otp = location.state?.otp || "";
        const phoneNumber = location.state?.phoneNumber || "";

        if (pinVal.length !== 4) {
            setErrors((prev) => ({ ...prev, newPin: "Please enter 4-digit PIN" }));
            return;
        }
        if (confirmVal.length !== 4) {
            setErrors((prev) => ({ ...prev, confirmPin: "Please confirm your PIN" }));
            return;
        }
        if (pinVal !== confirmVal) {
            setErrors((prev) => ({ ...prev, confirmPin: "PINs do not match" }));
            return;
        }

        if (!otp || !phoneNumber) {
            alert("Session expired or invalid. Please start again.");
            navigate("/forgot-pin");
            return;
        }

        setLoading(true);
        // Final payload as requested by user
        const payload = {
            phoneNumber,
            otp,
            newPin: pinVal
        };

        LoginApi.resetPin(payload).then((result) => {
            setLoading(false);
            if (result.status) {
                navigate("/sign-in");
            }
        }).catch((err) => {
            setLoading(false);
            console.error("Reset PIN error:", err);
        });
    };

    return (
        <section className="auth min-vh-100 d-flex justify-content-center align-items-center bg-primary-600">
            <style>
                {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .login-card {
            animation: fadeInUp 0.6s ease-out;
          }
        `}
            </style>

            <div
                className="login-card bg-white radius-16 p-32 p-sm-40 shadow-lg text-center mx-3"
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
                    <h4 className="mb-12 fw-bold text-dark">Set New PIN</h4>
                    <p className="text-secondary-light text-md">
                        Create a new 4-digit security PIN for your account
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-24 text-start">
                        <label className="form-label text-secondary text-sm fw-medium mb-8">
                            New PIN
                        </label>
                        <div className="d-flex gap-8">
                            {newPin.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (newPinRefs.current[index] = el)}
                                    type={showPin ? "text" : "password"}
                                    inputMode="numeric"
                                    className="form-control h-48-px bg-neutral-50 radius-12 text-center text-lg fw-bold border-2 focus-border-primary p-0"
                                    style={{ width: "80px" }}
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handlePinChange(index, e.target.value, "new")}
                                    onKeyDown={(e) => handleKeyDown(index, e, "new")}
                                    disabled={loading}
                                />
                            ))}
                        </div>
                        {errors.newPin && (
                            <span className="text-danger text-xs mt-1 d-block">{errors.newPin}</span>
                        )}
                    </div>

                    <div className="mb-32 text-start">
                        <label className="form-label text-secondary text-sm fw-medium mb-8 d-flex justify-content-between">
                            Confirm New PIN
                            <button
                                type="button"
                                className="btn btn-sm border-0 p-0 text-secondary-light shadow-none"
                                onClick={() => setShowPin(!showPin)}
                                tabIndex="-1"
                            >
                                <Icon
                                    icon={showPin ? "lucide:eye-off" : "lucide:eye"}
                                    className="text-xl"
                                />
                            </button>
                        </label>
                        <div className="d-flex gap-8">
                            {confirmPin.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (confirmPinRefs.current[index] = el)}
                                    type={showPin ? "text" : "password"}
                                    inputMode="numeric"
                                    className="form-control h-48-px bg-neutral-50 radius-12 text-center text-lg fw-bold border-2 focus-border-primary p-0"
                                    style={{ width: "80px" }}
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handlePinChange(index, e.target.value, "confirm")}
                                    onKeyDown={(e) => handleKeyDown(index, e, "confirm")}
                                    disabled={loading}
                                />
                            ))}
                        </div>
                        {errors.confirmPin && (
                            <span className="text-danger text-xs mt-1 d-block">{errors.confirmPin}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 radius-12 h-56-px fw-semibold"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Resetting PIN...
                            </>
                        ) : (
                            "Reset PIN"
                        )}
                    </button>
                </form>

                <div className="mt-32 text-center">
                    <Link to="/sign-in" className="text-secondary-light fw-medium text-sm">
                        <Icon icon="lucide:arrow-left" className="me-8" />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ResetPinLayer;
