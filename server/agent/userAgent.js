const UAParser = require('ua-parser-js');

const getUserDevice = (userAgent) => {
  const parser = new UAParser();
  parser.setUA(userAgent);
  const result = parser.getResult();

  // You can adjust this to return more specific values (e.g., mobile, tablet, desktop)
  if (result.device.type) {
    return result.device.type; // 'mobile', 'tablet', 'desktop'
  }
  return 'desktop'; // Default to 'desktop' if not found
};

module.exports = { getUserDevice };
