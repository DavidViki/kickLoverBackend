const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc Register a new user and log them in
// @route POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({
      message: "User already exists",
    });
  } else {
    // Create new user
    const user = await User.create({
      username,
      email,
      password, // Password will be hashed in User model's pre-save middleware
    });

    if (user) {
      res.status(201).json({
        token: generateToken(user._id, user.isAdmin),
        userId: user._id,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(400).json({
        message: "Invalid user data",
      });
    }
  }
});

// @desc Authenticate user and get token
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Check if the user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Validate password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = generateToken(user._id, user.isAdmin);

  // Respond with the token and user data
  res.status(200).json({ token, userId: user._id, isAdmin: user.isAdmin });
});

// @desc Get user profile
// @route GET /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } else {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
});

// @desc Update user profile
// @route PUT /api/user/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      token: generateToken(updatedUser._id),
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      },
    });
  } else {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
});

// @desc Delete user profile
// @route DELETE /api/users/profile
// @access Private
const deleteUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    await user.remove();
    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } else {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
});

// @desc Delete a user account (Admin only)
// @route DELETE /api/users/:id
// @access Private/Admin
const deleteUserByAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.remove();
    res.status(200).json({
      success: true,
      message: `User ${user.username} deleted successfully`,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
});

// @desc Fetch all users
// @route GET /api/users
// @access Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Exclude the password field
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve users" });
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  deleteUserByAdmin,
  getAllUsers,
};
