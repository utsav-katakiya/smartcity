import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/AdminLogin.css"; 

const DepartmentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "dept123") {
      // Simulate different departments based on email given
      const deptParam = email.split("@")[0].toLowerCase();
      let fullDeptName = "General";
      
      if (deptParam.includes("water")) fullDeptName = "Water Department";
      else if (deptParam.includes("electric")) fullDeptName = "Electricity Department";
      else if (deptParam.includes("sanitat") || deptParam.includes("clean")) fullDeptName = "Sanitation Department";
      else if (deptParam.includes("road")) fullDeptName = "Road & Infrastructure";
      else if (deptParam.includes("garden") || deptParam.includes("environment")) fullDeptName = "Garden & Environment";
      else if (deptParam.includes("animal")) fullDeptName = "Animal Control";
      else if (deptParam.includes("health")) fullDeptName = "Health Department";
      else if (deptParam.includes("public") || deptParam.includes("work")) fullDeptName = "Public Works";
      else if (deptParam.includes("recreation")) fullDeptName = "Recreation";
      else if (deptParam.includes("fire")) fullDeptName = "Fire Department";
      
      // We use sessionStorage to allow multiple departments open in different tabs!
      sessionStorage.setItem("dept_auth_token", "true");
      sessionStorage.setItem("dept_name", fullDeptName);
      navigate("/department-dashboard");
    } else {
      setError("Invalid credentials. Password is 'dept123', email prefix becomes your department name.");
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h2>Department Authentication</h2>
        <p>Hardcoded test: [dept]@scit.com / dept123<br/>
           <span style={{fontSize: '12px'}}>(e.g. typing <b>water</b>@scit.com isolates this tab for the Water department)</span>
        </p>
        
        {error && <div className="admin-login-error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="text" 
              placeholder="e.g. water@scit.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="admin-login-btn">Secure Login</button>
        </form>
      </div>
    </div>
  );
};

export default DepartmentLogin;
