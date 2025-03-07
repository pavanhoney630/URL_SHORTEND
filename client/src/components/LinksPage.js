import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPencilAlt, FaTrash, FaCopy } from "react-icons/fa";
import styles from "../css/LinkPage.module.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define BASE_URL using environment variable
const BASE_URL =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_DEV_URL
    : process.env.REACT_APP_PROD_URL;

const LinkPage = ({ searchQuery }) => {
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUrl, setEditUrl] = useState(null); // Keep editUrl to track which link is being edited
  const [newOriginalUrl, setNewOriginalUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Toggle editing mode
  const [remarks, setRemarks] = useState(""); // Manage remarks
  const [expirationOn, setExpirationOn] = useState(false); // Manage expiration toggle
  const [expirationDate, setExpirationDate] = useState(""); // Manage expiration date

  const [popup, setPopup] = useState(null);

  // Optionally, if you want to ensure the hidden URL is completely masked and not displayed in any case
  document.querySelectorAll(".hiddenUrl").forEach((element) => {
    element.style.display = "none";
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7; // Rows per page

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/auth/user/urls`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const urls = response.data.urls || [];
        setLinks(
          urls.map((link) => ({
            originalUrl: link.originalUrl,
            shortenedUrl: link.shortenedUrl, // Keep the hash without prepending the BASE_URL
            totalClicks: link.totalClicks,
            createdAt: link.createdAt,
            expirationDate: link.expirationDate,
            remarks: link.remarks || "", // Ensure remarks are properly fetched
          }))
        );
      } catch (err) {
        setError("Failed to fetch links. Please try again later.");
        console.error("Error fetching links:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  // Filter links based on search query
  const filteredLinks = links.filter(
    (link) =>
      link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.shortenedUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.remarks.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get links for the current page
  const indexOfLastLink = currentPage * rowsPerPage;
  const indexOfFirstLink = indexOfLastLink - rowsPerPage;
  const currentLinks = filteredLinks.slice(indexOfFirstLink, indexOfLastLink);

  const handleEdit = (shortenedUrl, originalUrl) => {
    setEditUrl(shortenedUrl); // Set the URL to be edited
    setNewOriginalUrl(originalUrl); // Set the original URL for editing
    setIsEditing(true); // Enable editing mode
    setPopup("edit");
  };

  const handleUpdate = async () => {
    console.log("editUrl inside handleUpdate:", editUrl);
    if (!editUrl) {
      setError("No URL selected for update.");
      return;
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/auth/update/${editUrl}`,
        { newOriginalUrl },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedLink = response.data;
      console.log("Updated link:", updatedLink);

      // Update the links list with the new original URL
      setLinks((prevLinks) =>
        prevLinks.map((link) =>
          link.shortenedUrl === editUrl
            ? { ...link, originalUrl: updatedLink.originalUrl }
            : link
        )
      );

      // Reset state only after the update is done
      setIsEditing(false); // Exit editing mode
      setEditUrl(null); // Reset editUrl after the update
      setPopup("edit"); // Optionally reset popup if needed
    } catch (err) {
      setError("Failed to update the link. Please try again.");
      console.error("Error updating URL:", err);
    }
  };

  const handleDelete = async (shortenedUrl) => {
    try {
      await axios.delete(`${BASE_URL}/auth/delete/${shortenedUrl}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setLinks((prevLinks) =>
        prevLinks.filter((link) => link.shortenedUrl !== shortenedUrl)
      );
      setPopup(null); // Close popup
    } catch (err) {
      setError("Failed to delete the link. Please try again.");
      console.error("Error deleting URL:", err);
    }
  };

  const handleCopy = (shortenedUrl) => {
    const fullUrl = `${BASE_URL}/auth/${shortenedUrl}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("URL copied to clipboard!");
  };

  const handleRedirect = async (shortenedUrl) => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/${shortenedUrl}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const updatedLink = response.data;
      console.log(updatedLink);

      // Check if the link is expired
      if (
        updatedLink.expirationDate &&
        new Date(updatedLink.expirationDate) < new Date()
      ) {
        window.location.href = "/link-expired"; // Redirect to a link-expired page
      } else {
        // Update the link's totalClicks on the frontend
        setLinks((prevLinks) =>
          prevLinks.map((link) =>
            link.shortenedUrl === shortenedUrl
              ? { ...link, totalClicks: updatedLink.totalClicks }
              : link
          )
        );

        // Redirect to the original URL received from the backend
        window.location.href = updatedLink.originalUrl;
      }
    } catch (err) {
      console.error("Error occurred:", err);
      toast.error("Error occurred. Please try again later.");
    }
  };

  const getStatusColor = (expirationDate) => {
    return expirationDate && new Date(expirationDate) < new Date()
      ? "Orange"
      : "green";
  };

  const handleNextPage = () => {
    if (currentPage * rowsPerPage < filteredLinks.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const LogOut = () => {
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <>
      <button className={styles.logout} onClick={LogOut}>
        Logout
      </button>
      <div className={styles.container}>
        <h1>Created Links</h1>

        {loading ? (
          <p>Loading links...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : filteredLinks.length === 0 ? (
          <p>No links found matching your search query!</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Original Link</th>
                  <th>Short Link</th>
                  <th></th>
                  <th>Remarks</th>
                  <th>Clicks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentLinks.map((link) => (
                  <tr key={link.shortenedUrl}>
                    <td>
                      {new Date(link.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}
                    </td>
                    <td>
                      {link.originalUrl}
                      <FaCopy
                        onClick={() => handleCopy(link.originalUrl)}
                        className={styles.icon}
                      />
                      <ToastContainer
                        position="bottom-left"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={true}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                      />
                    </td>
                    <td>
                      <span
                        onClick={() => handleRedirect(link.shortenedUrl)}
                        className={styles.link}
                      >
                        {BASE_URL}/
                        <span className={styles.hiddenUrl}>
                          {link.shortenedUrl}
                        </span>
                      </span>
                      <FaCopy
                        onClick={() => handleCopy(link.shortenedUrl)}
                        className={styles.icon}
                      />
                    </td>
                    <td>:</td>
                    <td>{link.remarks || "No remarks"}</td>
                    <td>{link.totalClicks}</td>
                    <td style={{ color: getStatusColor(link.expirationDate) }}>
                      {link.expirationDate &&
                      new Date(link.expirationDate) < new Date()
                        ? "Inactive"
                        : "Active"}
                    </td>
                    <td>
                      {isEditing && editUrl === link.shortenedUrl ? (
                        // Don't show the pencil button when editing
                        <button onClick={handleUpdate}>Save</button>
                      ) : (
                        <FaPencilAlt
                          onClick={() =>
                            handleEdit(link.shortenedUrl, link.originalUrl)
                          }
                          className={`${styles.icon} ${styles.edit}`}
                        />
                      )}
                      <FaTrash
                        onClick={() =>
                          setPopup({
                            type: "delete",
                            shortenedUrl: link.shortenedUrl,
                          })
                        }
                        className={`${styles.icon} ${styles.delete}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className={styles.pagination}>
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span>
            Page {currentPage} of{" "}
            {Math.ceil(filteredLinks.length / rowsPerPage)}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage * rowsPerPage >= filteredLinks.length}
          >
            Next
          </button>
        </div>

        {/* Popup for Edit */}
        {popup === "edit" && isEditing && editUrl !== null && (
          <div className={styles.popup}>
            <div className={styles.popupContent}>
              <h2>Edit Link</h2>

              {/* Original URL Input */}
              <label className={styles.inputLabel}>Original URL</label>
              <input
                type="text"
                value={newOriginalUrl}
                onChange={(e) => setNewOriginalUrl(e.target.value)}
                className={styles.inputField}
                placeholder="Enter the original URL"
              />

              {/* Remarks Input */}
              <label className={styles.inputLabel}>Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className={styles.inputField}
                placeholder="Add remarks (optional)"
              />

              {/* Expiration Switch */}
              <div className={styles.switchContainer}>
                <label className={styles.inputLabel}>Enable Expiration</label>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    id="glideSwitch"
                    checked={expirationOn}
                    onChange={() => setExpirationOn(!expirationOn)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              {expirationOn && (
                <>
                  <label className={styles.inputLabel}>Expiration Date</label>
                  <input
                    type="datetime-local"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className={styles.inputField}
                  />
                </>
              )}

              {/* Buttons */}
              <div className={styles.buttonGroup}>
                <button onClick={handleUpdate} className={styles.updateButton}>
                  Update
                </button>
                <button
                  onClick={() => setPopup(null)}
                  className={styles.closeButton}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Popup for Delete */}
        {popup && popup.type === "delete" && (
          <div className={styles.popup}>
            <div className={styles.popupContent}>
              <h2>Are you sure you want to delete this link?</h2>
              <button
                onClick={() => handleDelete(popup.shortenedUrl)}
                className={styles.deleteButton}
              >
                Yes, delete
              </button>
              <button
                onClick={() => setPopup(null)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LinkPage;
