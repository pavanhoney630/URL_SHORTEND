const ShortenedUrl = require('../models/Clickmodel');
const User = require("../models/Usermodel");
const jwt = require('jsonwebtoken');  // Import JWT for token verification
const mongoose = require('mongoose');
const userAgentParser = require('ua-parser-js'); // Install this library: npm install ua-parser-js
const { nanoid } = require('nanoid');




// Base URL for production and local environments
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://url-shortend-auth.vercel.app' // Production URL
    : 'http://localhost:5000'; // Local development URL

// Create Shortened URL
const createShortenedUrl = async (req, res) => {
  const { originalUrl, expirationInDays, remarks } = req.body; // Include remarks in the request body
  const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the request headers
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  if (!originalUrl) {
    return res.status(400).json({ message: 'Original URL is required' });
  }

  // Ensure remarks is required
  if (!remarks) {
    return res.status(400).json({ message: 'Remarks are required' });
  }

  try {
    // Decode and verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id; // Get the userId from the token

    // Generate a unique shortened URL (6-8 alphanumeric characters)
    const shortenedUrl = nanoid(8);

    // Set the expiration date (optional, default to no expiration)
    const expirationDate = expirationInDays
      ? new Date(Date.now() + expirationInDays * 24 * 60 * 60 * 1000)
      : null;

    // Get the current timestamp
    const createdAt = new Date();

    // Extract user-agent details to capture device, browser, and OS information
    const ua = userAgentParser(req.headers['user-agent']);
    const deviceType = ua.device.type || 'desktop'; // Default to 'desktop'
    const os = ua.os.name || 'unknown'; // Default to 'unknown'
    const browser = ua.browser.name || 'unknown'; // Default to 'unknown'

    // Capture the IP address of the device that created the URL
    const createdDeviceIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Save the shortened URL to the database with userId and creation details
    const newUrl = new ShortenedUrl({
      originalUrl,
      shortenedUrl,
      userId, // Store userId here
      remarks:  remarks || "No remarks", // Store remarks here
      clicksByDate: {}, // Initialize an empty clicksByDate object
      visits: [], // Initialize an empty visits array
      createdAt,
      expirationDate,
      creationDetails: {
        ip: createdDeviceIp, // IP address of the device that created the shortened URL
        browser: browser,
        device: deviceType,
        os: os,
      },
    });

    await newUrl.save();

    return res.status(201).json({
      originalUrl,
      shortenedUrl: `${BASE_URL}/${shortenedUrl}`, // Use dynamic base URL
      expirationDate: expirationDate ? expirationDate.toISOString() : 'No expiration',
      message: 'URL shortened successfully',
      remarks, // Include remarks in the response
      ip: createdDeviceIp,
      userId,
    });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Only one declaration should exist
const clickAndTrack = async (req, res) => {
  const { shortenedUrl } = req.params;

  // Get the current date and timestamp
  const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const timestamp = new Date(); // Full timestamp
  const visitorIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  try {
    // Find the URL by its shortened version
    const url = await ShortenedUrl.findOne({ shortenedUrl });

    if (!url) {
      return res.status(404).json({ message: 'Shortened URL not found' });
    }

    // Increment the click count for the current date
    const deviceType = getUserDevice(req.headers['user-agent']); // Get device type (mobile, desktop, tablet)
    const ua = userAgentParser(req.headers['user-agent']); // Parse user-agent
    const os = ua.os.name || 'unknown';
    const browser = ua.browser.name || 'unknown';

    // Update clicks by date and device type
    await ShortenedUrl.updateOne(
      { shortenedUrl },
      {
        $inc: {
          [`clicksByDate.${currentDate}.totalClicks`]: 1,
          [`clicksByDate.${currentDate}.deviceClicks.${deviceType}`]: 1,
        },
      }
    );

    // Add the visitor's details to the `visits` array
    url.visits.push({
      date: currentDate,
      timestamp,
      originalUrl: url.originalUrl,
      shortenedUrl: url.shortenedUrl,
      os,
      browser,
      ip: visitorIp,
      device: deviceType,
    });

    // Save the updated URL document
    await url.save();

    // Redirect to the original URL
    return res.redirect(url.originalUrl);
  } catch (err) {
    console.error('Error in clickAndTrack function:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to get device type
const getUserDevice = (userAgent) => {
  const ua = userAgentParser(userAgent);
  return ua.device.type || 'desktop'; // Default to desktop if device type is undefined
};




const getUserUrls = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract the token
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Decode and verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    

    // Ensure the userId is a valid ObjectId string
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid User ID' });
    }

    // Create ObjectId from userId
    const userObjectId = new mongoose.Types.ObjectId(userId); // Use 'new' to properly instantiate ObjectId

    // Fetch all URLs created by the user
    const urls = await ShortenedUrl.find({ userId: userObjectId }).select(
      'originalUrl shortenedUrl clicksByDate createdAt expirationDate remarks'
    );
    

    

    if (!urls || urls.length === 0) {
      return res.status(200).json({ message: 'No URLs found for this user', urls: [] });
    }

    // Process the URLs to calculate total clicks for each
    const processedUrls = urls.map((url) => {
      let totalClicks = 0;

      // Calculate total clicks from clicksByDate
      if (url.clicksByDate) {
        for (let date in url.clicksByDate) {
          totalClicks += url.clicksByDate[date].totalClicks || 0;
        }
      }

      return {
        originalUrl: url.originalUrl,
        shortenedUrl: `${url.shortenedUrl}`, // Use existing BASE_URL logic
        totalClicks,
        remarks: url.remarks || 'No remarks', // Handle undefined remarks
        createdAt: url.createdAt,
        expirationDate: url.expirationDate,
      };
      
    });

    
    return res.status(200).json({
      message: 'User URLs fetched successfully',
      urls: processedUrls,
    });
  } catch (err) {
    console.error('Error fetching user URLs:', err);

    // Handle token errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }

    // General server error
    return res.status(500).json({ message: 'Server error' });
  }
};


const GetAnalytics = async (req, res) => {
  console.log("GetAnalytics route hit");
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Token received:", token);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decodedToken);

    const userId = decodedToken.id;
    console.log("User ID:", userId);

    // Validate the userId as an ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    // Create ObjectId instance
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Query for URLs created by the user
    const urls = await ShortenedUrl.find({ userId: userObjectId });
    console.log("URLs fetched for user:", urls);

    if (!urls.length) {
      return res.status(404).json({ message: "No URLs found for this user." });
    }

    // Process visits data
    const allVisits = urls.flatMap((url) =>
      url.visits.map((visit) => ({
        timestamp: visit.timestamp,
        originalUrl: url.originalUrl,
        shortenedUrl: url.shortenedUrl,
        device: visit.device,
        ip: visit.ip,
        os: visit.os,
        browser: visit.browser,
      }))
    );

    res.status(200).json({
      visits: allVisits,
      totalVisits: allVisits.length,
      message: "Analytics retrieved successfully",
    });
  } catch (err) {
    console.error("Error in GetAnalytics function:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const updateOriginalUrl = async (req, res) => {
  // Extract shortenedUrl from route parameters and newOriginalUrl from the request body
  const { shortenedUrl } = req.params;
  const { newOriginalUrl } = req.body;

  // Debug: Log the received parameters
  console.log("Received request to update:", { shortenedUrl, newOriginalUrl });

  try {
    // Find the URL entry in the database using shortenedUrl
    const url = await ShortenedUrl.findOne({ shortenedUrl });

    // Debug: Log the result of the database query
    console.log("Fetched URL from database:", url);

    if (!url) {
      console.error("Shortened URL not found");
      return res.status(404).json({ message: 'Shortened URL not found' });
    }

    // Update the original URL in the database
    url.originalUrl = newOriginalUrl;
    await url.save();

    // Debug: Log the updated URL entry
    console.log("Updated URL successfully:", url);

    return res.status(200).json({
      originalUrl: url.originalUrl,
      shortenedUrl: url.shortenedUrl, // Send just the hash
      totalClicks: url.totalClicks,
      createdAt: url.createdAt,
      expirationDate: url.expirationDate,
    });
    
  } catch (err) {
    console.error("Error updating URL:", err);
    return res.status(500).json({ message: 'Server Error' });
  }
};



  const deleteShortenedUrl = async (req, res) => {
    const { shortenedUrl } = req.params;
  
    try {
      // Find and delete the shortened URL document
      const deletedUrl = await ShortenedUrl.findOneAndDelete({ shortenedUrl });
  
      if (!deletedUrl) {
        return res.status(404).json({ message: 'Shortened URL not found' });
      }
  
      // Optionally, delete associated data like clicks and analytics
      // Assuming analytics are stored in the User model
      await User.updateMany(
        { 'analytics.shortenedUrl': shortenedUrl },
        { $pull: { analytics: { shortenedUrl } } }
      );
  
      return res.status(200).json({ message: 'Shortened URL and associated data deleted successfully' });
    } catch (err) {
      console.error('Error deleting shortened URL:', err);
      return res.status(500).json({ message: 'Server Error' });
    }
  };
  

// Helper function to group clicks by date and device

const GetUserClicks = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract the token
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Decode and verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    // Ensure the userId is a valid ObjectId string
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid User ID' });
    }

    // Create ObjectId from userId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Fetch all URLs created by the user
    const urls = await ShortenedUrl.find({ userId: userObjectId }).select('clicksByDate');

    if (!urls || urls.length === 0) {
      return res.status(200).json({
        message: 'No URLs found for this user',
        data: { totalClicks: 0, dateWiseClicks: [], deviceClicks: { Mobile: 0, Desktop: 0, Tablet: 0 } },
      });
    }

    // Initialize data containers
    let totalClicks = 0;
    let dateWiseClicks = {}; // Object to aggregate clicks by date
    let deviceClicks = { Mobile: 0, Desktop: 0, Tablet: 0 }; // Initialize deviceClicks

    // Process each URL and its clicks data
    urls.forEach((url) => {
      if (url.clicksByDate) {
        // Iterate through the clicksByDate object for the URL
        for (let date in url.clicksByDate) {
          const dateData = url.clicksByDate[date];

          // Add to total clicks
          totalClicks += dateData.totalClicks || 0;

          // Initialize the date entry if not already present
          if (!dateWiseClicks[date]) {
            dateWiseClicks[date] = {
              totalClicks: 0,
              deviceClicks: { Mobile: 0, Desktop: 0, Tablet: 0 },
            };
          }

          // Update date-wise total clicks
          dateWiseClicks[date].totalClicks += dateData.totalClicks || 0;

          // Aggregate device clicks for this date
          if (dateData.deviceClicks) {
            for (let device in dateData.deviceClicks) {
              const deviceKey = device.charAt(0).toUpperCase() + device.slice(1).toLowerCase(); // Normalize device keys
              if (deviceClicks[deviceKey] !== undefined) {
                // Update overall device clicks
                deviceClicks[deviceKey] += dateData.deviceClicks[device] || 0;

                // Update device clicks for the specific date
                dateWiseClicks[date].deviceClicks[deviceKey] += dateData.deviceClicks[device] || 0;
              }
            }
          }
        }
      }
    });

    // Convert dateWiseClicks object to an array of { date, totalClicks, deviceClicks }
    const aggregatedDateWiseClicks = Object.keys(dateWiseClicks).map(date => ({
      date,
      totalClicks: dateWiseClicks[date].totalClicks,
      deviceClicks: dateWiseClicks[date].deviceClicks,
    }));

    return res.status(200).json({
      message: 'User clicks data fetched successfully',
      data: { totalClicks, dateWiseClicks: aggregatedDateWiseClicks, deviceClicks },
    });
  } catch (err) {
    console.error('Error fetching user clicks:', err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }

    return res.status(500).json({ message: 'Server error' });
  }
};



module.exports = { createShortenedUrl, getUserUrls, clickAndTrack,updateOriginalUrl,deleteShortenedUrl,GetUserClicks, GetAnalytics };
