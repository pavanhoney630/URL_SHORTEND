import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../css/SettingsPage.module.css";

// Set BASE_URL dynamically for development/production
const BASE_URL =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_DEV_URL
    : process.env.REACT_APP_PROD_URL;

const SettingsPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage

  useEffect(() => {
    // Fetch current user info on load
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/auth/user/update`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { data } = response;
        setName(data.name);
        setEmail(data.email);
        setMobile(data.mobile);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserInfo();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") setName(value);
    if (name === "email") setEmail(value);
    if (name === "mobile") setMobile(value);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name) newErrors.name = "Name is required";
    if (!email || !/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Please enter a valid email";
    if (!mobile || !/^\d{10}$/.test(mobile))
      newErrors.mobile = "Please enter a valid mobile number (10 digits)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // If no errors, return true
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Prevent submission if validation fails

    try {
      setLoading(true);
      await axios.put(
        `${BASE_URL}/auth/user/update`,
        { name, email, mobile },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Account details updated successfully!");
    } catch (error) {
      console.error("Error updating account", error);
      alert(
        error.response
          ? error.response.data.message
          : "Failed to update account details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!name || !email || !mobile) {
      // If fields are empty, mark them red and prevent delete
      setErrors({
        name: "Name is required",
        email: "Email is required",
        mobile: "Mobile number is required",
      });
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete your account? This action is irreversible."
      )
    ) {
      try {
        setLoading(true);
        await axios.delete(`${BASE_URL}/auth/user/delete`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { name, email, mobile },
        });
        alert("Account deleted successfully!");
        // Redirect to the login page or home page after deletion
        window.location.href = "/login";
      } catch (error) {
        console.error("Error deleting account", error);
        alert(
          error.response
            ? error.response.data.message
            : "Failed to delete account."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <h2>Settings</h2>
      <form onSubmit={handleSaveChanges} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={handleInputChange}
            className={`${styles.input} ${
              errors.name ? styles.errorInput : ""
            }`} // Conditionally add error class
          />
          {errors.name && <p className={styles.error}>{errors.name}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email id</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleInputChange}
            className={`${styles.input} ${
              errors.email ? styles.errorInput : ""
            }`} // Conditionally add error class
          />
          {errors.email && <p className={styles.error}>{errors.email}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="mobile">Mobile no.</label>
          <input
            type="text"
            id="mobile"
            name="mobile"
            value={mobile}
            onChange={handleInputChange}
            className={`${styles.input} ${
              errors.mobile ? styles.errorInput : ""
            }`} // Conditionally add error class
          />
          {errors.mobile && <p className={styles.error}>{errors.mobile}</p>}
        </div>

        <div className={styles.buttons}>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className={styles.deleteButton}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
