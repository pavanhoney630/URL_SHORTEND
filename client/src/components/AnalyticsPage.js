import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "../css/AnalyticsPage.module.css";

const BASE_URL =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_DEV_URL
    : process.env.REACT_APP_PROD_URL;

const AnalyticsPage = () => {
  const [visits, setVisits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(7);  // Adjust page size based on your preference
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' }); // Sorting state

  const sortVisits = useCallback((visits) => {
    return [...visits].sort((a, b) => {
      if (sortConfig.key === 'timestamp') {
        return sortConfig.direction === 'desc'
          ? new Date(b.timestamp) - new Date(a.timestamp)
          : new Date(a.timestamp) - new Date(b.timestamp);
      } else if (sortConfig.key === 'shortenedUrl') {
        return sortConfig.direction === 'desc'
          ? a.shortenedUrl.localeCompare(b.shortenedUrl)
          : b.shortenedUrl.localeCompare(a.shortenedUrl);
      }
      return 0;
    });
  }, [sortConfig]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');  // Get token from localStorage
        console.log(token);

        if (!token) {
          console.error('No token found');
          return;
        }
       console.log("itsworking");
        // Make the API call with the token in the Authorization header
        const response = await axios.get(`${BASE_URL}/analytics`, {
          headers: { Authorization: `Bearer ${token}` }  // Send token in request header
        });

        console.log("Response Data:", response.data);  // Check what is returned

        if (!response.data || !Array.isArray(response.data.visits)) {
          console.error("Visits data not found or is not an array.");
          setVisits([]);  // Set empty array to avoid rendering errors
          return;
        }
        console.log("im working here");

        const sortedVisits = sortVisits(response.data.visits);
        setVisits(sortedVisits);
        console.log("Sorted Visits:", sortedVisits);  // Check the sorted data
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setVisits([]);  // In case of error, set empty array
      }
    };

    fetchAnalytics();
  }, [sortConfig, sortVisits]);

  const totalPages = Math.ceil(visits.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = visits.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className={styles.analyticsPage}>
      <h1 className={styles.header}>Analytics</h1>
      {visits.length === 0 ? (
        <p>No data available to display.</p>
      ) : (
        <div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort('timestamp')}>
                  Timestamp {sortConfig.key === 'timestamp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th>Original Link</th>
                <th onClick={() => handleSort('shortenedUrl')}>
                  Shortened Link {sortConfig.key === 'shortenedUrl' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th>IP Address</th>
                <th>User Device</th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((visit, index) => (
                <tr key={index}>
                  <td>
                    {new Date(visit.timestamp).toLocaleDateString()}{" "}
                    {new Date(visit.timestamp).toLocaleTimeString()}
                  </td>
                  <td>{visit.originalUrl}</td>
                  <td>{visit.shortenedUrl}</td>
                  <td>{visit.ip}</td>
                  <td>{visit.device}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.pagination}>
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
