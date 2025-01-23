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
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Compare the password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
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
  
module.exports = {
    signup,
    login
}