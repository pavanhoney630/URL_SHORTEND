const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  date: {
    type: String, // Store the visit date as YYYY-MM-DD
    required: true,
  },
  device: {
    type: String, // Device type (mobile, desktop, tablet)
    required: true,
    enum: ["mobile", "desktop", "tablet"],
  },
  ip: {
    type: String, // Visitor's IP address
    required: true,
  },
  os: {
    type: String, // Operating system (e.g., Android, iOS, Windows, etc.)
    required: true,
  },
  browser: {
    type: String, // Browser used (Chrome, Safari, etc.)
    required: true,
  },
  timestamp: {
    type: Date, // Timestamp of the visit
    required: true,
  },
  originalUrl: {
    type: String, // The original URL that was shortened
    required: true,
  },
  shortenedUrl: {
    type: String, // The shortened URL
    required: true,
  },
});


// Schema for shortened URL data
const shortenedUrlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          // Allow URLs with or without a scheme (http:// or https://)
          return /^(ftp|http|https):\/\/[^ "]+$|^[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
      set: (v) => {
        // Automatically prepend 'http://' if the URL doesn't have a scheme
        if (!/^https?:\/\//.test(v)) {
          return `http://${v}`;
        }
        return v;
      },
    },
    shortenedUrl: {
      type: String,
      required: true,
      unique: true,
      index: true, // Ensure fast lookups for shortened URLs
    },
    
    visits: [visitSchema], // Embed the visitSchema for detailed tracking
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to User model (assuming you have a 'User' model)
      required: true,
    },
    remarks: {
    type: String,
    required: true, // Ensure remarks is always present
  },
  clicksByDate: {
    type: Map,
    of: {
      totalClicks: { type: Number, default: 0 },
      deviceClicks: {
        type: Map,
        of: Number, // Device types, e.g., desktop, mobile
        default: {}
      }
    },
    default: () => ({}),
  },
  
    creationDetails: {
      ip: { type: String, required: true }, // IP address of the device that created the URL
      browser: { type: String, required: true }, // Browser used to create the URL
      device: { type: String, required: true }, // Device type (mobile, desktop, tablet)
      os: { type: String, default: "unknown" }, // Operating system (e.g., Android, iOS, Windows, etc.)
    },
    expirationDate: { type: Date, default: null },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create the model
const ShortenedUrl = mongoose.model('ShortenedUrl', shortenedUrlSchema);

module.exports = ShortenedUrl;
