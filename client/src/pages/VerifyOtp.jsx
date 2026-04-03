import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/otp.css";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // OTP + user data login page se aaya hai
  const correctOtp = location.state?.otp?.toString() || "";
  const user = location.state?.user || null;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");

  const inputs = useRef([]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Next box focus
    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Backspace → previous box
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const verifyOtp = () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length < 6) {
      setError("Please enter complete OTP");
      return;
    }

    if (enteredOtp !== correctOtp) {
      setError("Wrong OTP");
      return;
    }

    // Login success
    alert("Login Successful");

    // Current logged-in user save
    localStorage.setItem("currentUser", JSON.stringify(user));

    navigate("/dashboard");
  };

  return (
    <div className="otpPage">
      <div className="otpCard">
        <h2>Verify OTP</h2>
        <p className="subText">Enter the 6-digit OTP sent to you</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            verifyOtp();
          }}
        >
          <div className="otpInputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                ref={(el) => (inputs.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>

          {error && <p className="errorText">{error}</p>}

          <button type="submit">Verify OTP</button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
