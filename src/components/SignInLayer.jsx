import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginApi from "../Api/LoginApi";

const SignInLayer = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ phoneNumber: "", pin: "" });
  const pinRefs = useRef([]);

  const handlePinChange = (index, value) => {
    if (isNaN(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setErrors((prev) => ({ ...prev, pin: "" }));

    if (value && index < 3) {
      pinRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs.current[index - 1].focus();
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Bypass validations and backend entirely
    localStorage.setItem("userToken", "mock-token");
    localStorage.setItem("userData", JSON.stringify({ name: "Admin", role: "admin", permissions: ["all"] }));
    setTimeout(() => {
      navigate("/");
    }, 100);

    setLoading(false);
  };

  return (
    <section
      className="auth min-vh-100 d-flex justify-content-center align-items-center bg-primary-600"

    >
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
          <h4 className="mb-12 fw-bold text-dark">Sign In</h4>
          <p className="text-secondary-light text-md">
            Enter Your Phone Number and PIN to Continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="icon-field mb-20 text-start">
            <label className="form-label text-secondary text-sm fw-medium mb-8">
              Phone Number
            </label>
            <div className="position-relative">
              <span className="icon top-50 translate-middle-y start-0 ms-3 text-secondary-light">
                <Icon icon="mage:phone" className="text-xl" />
              </span>
              <input
                type="tel"
                className="form-control h-56-px bg-neutral-50 radius-12 ps-5"
                placeholder="Enter Phone Number"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    setPhoneNumber(value);
                  }
                  setErrors((prev) => ({ ...prev, phoneNumber: "" }));
                }}
                maxLength={10}
                disabled={loading}
              />
            </div>
            {errors.phoneNumber && (
              <span className="text-danger text-xs mt-1">
                {errors.phoneNumber}
              </span>
            )}
          </div>

          <div className="mb-32 text-start">
            <label className="form-label text-secondary text-sm fw-medium mb-8">
              PIN
            </label>
            <div className="d-flex align-items-center gap-12">
              <div className="d-flex gap-8 flex-grow-1">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (pinRefs.current[index] = el)}
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    className="form-control h-48-px bg-neutral-50 radius-12 text-center text-lg fw-bold border-2 focus-border-primary p-0"
                    style={{ width: "80px" }}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={loading}
                  />
                ))}
              </div>
              <button
                type="button"
                className="btn btn-sm border-0 p-0 text-secondary-light shadow-none ms-auto"
                onClick={() => setShowPin(!showPin)}
                tabIndex="-1"
              >
                <Icon
                  icon={showPin ? "lucide:eye-off" : "lucide:eye"}
                  className="text-2xl"
                />
              </button>
            </div>
            {errors.pin && (
              <span className="text-danger text-xs mt-1 d-block">{errors.pin}</span>
            )}
            <div className="text-end mt-12">
              <Link
                to="/forgot-pin"
                className="text-primary-600 fw-semibold text-sm"
              >
                Forgot PIN?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 radius-12 h-56-px fw-semibold"

            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default SignInLayer;
