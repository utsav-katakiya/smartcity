import React from "react";
import { SignUp } from "@clerk/clerk-react";
import "../styles/signup.css";

const Signup = () => {
  return (
    <div className="signupPage">
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
};

export default Signup;