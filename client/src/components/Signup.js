import React, { useState } from "react";
import styles from "../css/Signup.module.css";
import { useNavigate } from "react-router-dom";
import cuvvetteImage from "./cuvvette.png";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!name || !email || !mobile || !password || !confirmPassword) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const url = "https://url-shortend-auth.vercel.app/auth/signup";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          mobile,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccessMessage("Account created successfully! Please log in.");
      setTimeout(() => navigate("/login"), 2000); // Redirect to login after success
      setErrorMessage("");
      setName("");
      setEmail("");
      setMobile("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage("");
    }
  };

  return (
    <div className={styles.signupContainer}>
      {/* Navigation Bar */}
      <nav className={styles.navbar}>
        <a href="/signup" className={styles.Signupbtn}>
          Sign Up
        </a>
        <a href="/login" className={styles.Loginbtn}>
          Log In
        </a>
      </nav>

      {/* Main Content */}
      <div className={styles.leftSide}>
        <img src={cuvvetteImage} alt="Background" />
      </div>
      <div className={styles.rightSide}>
        <h2>Join us Today!</h2>

        {/* Display Success/Error Messages */}
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        {successMessage && <p className={styles.success}>{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Mobile no."
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
