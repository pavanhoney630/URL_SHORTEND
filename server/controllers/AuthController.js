const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/Usermodel");



const signup = async (req, res) => {
    const { name, email, mobile, password, confirmPassword } = req.body;
  
    // Check if all fields are provided
    if (!name || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
  
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create a new user
      const newUser = new User({
        name,
        email,
        mobile,
        password: hashedPassword,
      });
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };


const login =  async (req, res) => {
    const { email, password } = req.body;
  
    // Check if all fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email' });
      }
  
      // Compare the password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid password' });
      }
  
      // Generate a JWT token
      const token = jwt.sign(
        { id: user._id, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.status(200).json({
        message: 'Login successful',
        token: token, // Make sure token is included
        name: user.name, // This should send the user's name
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  const userUpdate = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from header
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    try {
      // Decode token to get userId
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET); 
      const userId = decodedToken.id;
  
      // Get the updated details from request body
      const { name, email, mobile } = req.body;
  
      // Check for empty fields
      if (!name || !email || !mobile) {
        return res.status(400).json({ message: 'Name, email, and mobile are required' });
      }
  
      // Find the user by ID and update details
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update user details
      user.name = name;
      user.email = email;
      user.mobile = mobile;
  
      await user.save(); // Save the updated user
  
      return res.status(200).json({
        message: 'User details updated successfully',
        user: {
          name: user.name,
          email: user.email,
          mobile: user.mobile,
        },
      });
  
    } catch (error) {
      console.error('Error updating user details:', error);
  
      // Handle token errors
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
  
      return res.status(500).json({ message: 'Server error' });
    }
  };
  
  const userDelete = async (req, res) => {
    const { name, email, mobile } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
  
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;
  
        // Fetch user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
  
        // Debugging logs
        console.log('Request Details:', { name, email, mobile });
        console.log('User Details:', { name: user.name, email: user.email, mobile: user.mobile });
  
        // Convert mobile from the request body to a number for comparison
        const mobileAsNumber = Number(mobile);
  
        // Check if details match
        if (user.name !== name || user.email !== email || user.mobile !== mobileAsNumber) {
            return res.status(403).json({ message: 'Provided details do not match user account information' });
        }
  
        // Proceed with deletion
        await User.findByIdAndDelete(userId);
        return res.status(200).json({ message: 'User account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    signup,
    login,
    userUpdate,
    userDelete
};
