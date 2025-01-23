import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/Login.module.css";
import cuvvetteImage from './cuvvette.png';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const url = "https://url-shortend-api.vercel.app/api/login";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setSuccessMessage("Login successful! Redirecting...");
      setErrorMessage("");

      // Save name and token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.name);

      // Redirect to dashboard
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage("");
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Navigation Bar */}
      <nav className={styles.navbar}>
        <a href="/signup" className={styles.Signupbtn}>Sign Up</a>
        <a href="/login" className={styles.Loginbtn}>Log In</a>
      </nav>

      {/* Main Content */}
      <div className={styles.leftSide}>
        <img src={cuvvetteImage} alt="Background" />
      </div>
      <div className={styles.rightSide}>
        <h2>Welcome Back!</h2>

        {/* Display Error/Success Messages */}
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        {successMessage && <p className={styles.success}>{successMessage}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Log In</button>
        </form>
        <p>
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
