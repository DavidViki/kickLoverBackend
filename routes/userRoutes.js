const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  deleteUserByAdmin,
  getAllUsers,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

// @desc Register a new user and log them in
// @route POST /api/users/register
// @access Public
router.post("/register", registerUser);

// @desc Authenticate user and get token
// @route POST /api/users/login
// @access Public
router.post("/login", loginUser);

// @desc Get user profile
// @route GET /api/users/profile
// @access Private
router.get("/profile", protect, getUserProfile);

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
router.put("/profile", protect, updateUserProfile);

// @desc Delete own account
// @route DELETE /api/users/:id
// @access Private
router.delete("/profile", protect, deleteUserAccount);

// @desc Delete a user account by admin
// @route DELETE /api/users/:id
// @access Private/Admin
router.delete("/:id", protect, admin, deleteUserByAdmin);

// @desc Fetch all users
// @route GET /api/users
// @access Private/Admin
router.get("/", protect, admin, getAllUsers);

module.exports = router;
