import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/Dashboard.module.css";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import cuvvetteImage from "./cuvvette.png";
import LinkPage from "./LinksPage";
import AnalyticsPage from "./AnalyticsPage";
import SettingsPage from "./SettingsPage";
import {
  AiOutlineHome,
  AiOutlineLink,
  AiOutlineBarChart,
  AiOutlineSetting,
} from "react-icons/ai";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BASE_URL =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_DEV_URL
    : process.env.REACT_APP_PROD_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const storedName = localStorage.getItem("name") || "User";
  const token = localStorage.getItem("token");
  const [totalClicks, setTotalClicks] = useState(0);
  const [dateWiseClicks, setDateWiseClicks] = useState([]);
  const [deviceClicks, setDeviceClicks] = useState({
    Mobile: 0,
    Desktop: 0,
    Tablet: 0,
  });
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [remarks, setRemarks] = useState("");
  const [expirationDate, setExpirationDate] = useState(null);
  const [expirationOn, setExpirationOn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const getInitials = (name) => {
    const nameParts = name.trim().split(" ");
    return nameParts.length > 1
      ? nameParts[0][0] + nameParts[1][0]
      : nameParts[0].slice(0, 2).toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { message: "Good Morning", icon: "☀" };
    if (hour < 18) return { message: "Good Afternoon", icon: "🌤" };
    return { message: "Good Evening", icon: "🌥" };
  };

  const { message, icon } = getGreeting();
  const initials = getInitials(storedName);

  useEffect(() => {
    const fetchClicksData = async () => {
      try {
        const decodeToken = (token) => {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.id;
          } catch (e) {
            console.error("Invalid token format:", e);
            return null;
          }
        };

        const userId = decodeToken(token);
        if (!userId) {
          console.error("Invalid or missing userId");
          return;
        }

        const response = await axios.get(`${BASE_URL}/auth/user/clicks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const {
          totalClicks = 0,
          dateWiseClicks = [],
          deviceClicks = { Mobile: 0, Desktop: 0, Tablet: 0 },
        } = response.data.data || {};

        setTotalClicks(totalClicks);
        setDateWiseClicks(dateWiseClicks);
        setDeviceClicks(deviceClicks);
      } catch (error) {
        console.error("Error fetching click data:", error);
      }
    };

    if (token) {
      fetchClicksData();
    }
  }, [token]);

  useEffect(() => {
    const now = new Date();
    const formattedDate = now
      .toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "2-digit",
      })
      .replace(/\./g, "");
    setCurrentDateTime(formattedDate);
  }, []);

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleCreateShortenedUrl = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/create`,
        {
          originalUrl: destinationUrl,
          remarks,
          expirationInDays: expirationOn
            ? Math.ceil(
                (new Date(expirationDate) - new Date()) / (1000 * 3600 * 24)
              )
            : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(response.data.message);
      toggleModal();
    } catch (error) {
      console.error("Error creating shortened URL:", error);
    }
  };

  const barChartData = {
    labels: dateWiseClicks.map((click) => click.date),
    datasets: [
      {
        label: "Total Clicks",
        data: dateWiseClicks.map((click) => click.totalClicks),
        backgroundColor: "#007bff",
        borderColor: "#0056b3",
        borderWidth: 1,
      },
    ],
  };

  const barChartDeviceData = {
    labels: Object.keys(deviceClicks),
    datasets: [
      {
        label: "Device-wise Clicks",
        data: Object.values(deviceClicks),
        backgroundColor: ["#007bff", "#28a745", "#ffc107"],
        borderColor: ["#0056b3", "#1e7e34", "#d39e00"],
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Date-wise Total Clicks" },
      tooltip: { enabled: true },
    },
    indexAxis: "y",
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: true },
        ticks: {
          display: true,
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      x: {
        beginAtZero: true,
        grid: { display: false },
      },
    },
  };

  const barChartDeviceOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Device-wise Clicks" },
      tooltip: { enabled: true },
    },
    indexAxis: "y",
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: true },
      },
      x: {
        beginAtZero: true,
        grid: { display: false },
      },
    },
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    const route = tab === "dashboard" ? "/dashboard" : `/dashboard/${tab}`;
    navigate(route);
  };

  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <div className={styles.greeting}>
          <span>{icon}</span> {`${message}, ${storedName}`}
          <p className={styles.timestamp}>{currentDateTime}</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.createNew} onClick={toggleModal}>
            + Create new
          </button>
          <input
            type="text"
            className={styles.search}
            placeholder="Search by remarks, original URL, or short URL"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className={styles.profileIcon}>{initials}</div>
        </div>
      </header>
      {modalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <span>New Link</span>
              <button className={styles.closeModal} onClick={toggleModal}>
                X
              </button>
            </div>
            <div className={styles.modalBody}>
              <label htmlFor="destinationUrl">Destination URL*</label>
              <input
                type="text"
                id="destinationUrl"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
              />
              <label htmlFor="remarks">Remarks*</label>
              <textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
              <label htmlFor="expirationDate">Link Expiration</label>
              <div className={styles.glideSwitch}>
                <label htmlFor="glideSwitch" className={styles.label}>
                  Enable Expiration
                </label>
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
                <input
                  type="date"
                  id="expirationDate"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                />
              )}
            </div>
            <div className={styles.modalFooter}>
              <button onClick={handleCreateShortenedUrl}>Create Link</button>
              <button onClick={toggleModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <img
            src={cuvvetteImage}
            alt="Cuvette Logo"
            className={styles.logoImg}
          />
        </div>
        <nav>
          <ul className={styles.navLinks}>
            <li
              className={activeTab === "dashboard" ? styles.active : ""}
              onClick={() => handleTabClick("dashboard")}
            >
              <AiOutlineHome /> Dashboard
            </li>
            <li
              className={activeTab === "links" ? styles.active : ""}
              onClick={() => handleTabClick("links")}
            >
              <AiOutlineLink /> Links
            </li>
            <li
              className={activeTab === "analytics" ? styles.active : ""}
              onClick={() => handleTabClick("analytics")}
            >
              <AiOutlineBarChart /> Analytics
            </li>
            <li
              className={activeTab === "settings" ? styles.active : ""}
              onClick={() => handleTabClick("settings")}
            >
              <AiOutlineSetting /> Settings
            </li>
          </ul>
        </nav>
      </aside>

      <div className={styles.dashboard}>
        <main className={styles.main}>
          {activeTab === "dashboard" && (
            <>
              <div className={styles.totalClicks}>
                <h2>Total Clicks</h2>
                <p>{totalClicks}</p>
              </div>

              <div className={styles.clicksData}>
                <div className={styles.chart}>
                  <h3>Date-wise Clicks</h3>
                  <Bar data={barChartData} options={barChartOptions} />
                </div>

                <div className={styles.chartContainer}>
  <h2>Device-wise Clicks</h2>
  <Bar data={barChartDeviceData} options={barChartDeviceOptions} />
</div>

              </div>
            </>
          )}
          <div className={styles.Routing}>
            {activeTab === "links" && <LinkPage searchQuery={searchQuery} />}
            {activeTab === "analytics" && <AnalyticsPage />}
            {activeTab === "settings" && <SettingsPage />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;