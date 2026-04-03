import React from "react";
import { SignIn } from "@clerk/clerk-react";
import "../styles/login.css";

const Login = () => {
  return (
    <div className="loginPage">
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
};

export default Login;