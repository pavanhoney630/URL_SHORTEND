import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../css/Sidebar.module.css';

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <Link to="/dashboard/links">Links</Link>
      <Link to="/dashboard/analytics">Analytics</Link>
      <Link to="/dashboard/settings">Settings</Link>
    </div>
  );
};

export default Sidebar;
