const express = require("express");
const router = express.Router();
const {
  addProduct,
  updateProduct,
  restockProduct,
  deleteProduct,
  getAllProducts,
  getProductsByCategory,
  getProductsByBrand,
  getProductById,
  getFeaturedProducts,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

// @desc Add a new product
// @route POST /api/products
// @access Private/Admin
router.post("/", protect, admin, addProduct);

// @desc Update an existing product
// @route PUT /api/products/:id
// @access Private/Admin
router.put("/:id", protect, admin, updateProduct);

// @desc Restock an existing product
// @route PATCH /api/products/restock
// @access Private/Admin
router.patch("/restock", protect, admin, restockProduct);

// @desc Delete a product
// @route DELETE /api/products/:id
// @access Private/Admin
router.delete("/:id", protect, admin, deleteProduct);

// @desc Get all products
// @route GET /api/products
// @access Public
router.get("/", getAllProducts);

// @desc Get products by category
// @route GET /api/products/category/:category
// @access Public
router.get("/category/:category", getProductsByCategory);

// @desc Get products by brand
// @route GET /api/products/brand/:brand
// @access Public
router.get("/brand/:brand", getProductsByBrand);

// @desc Get featured products
// @route GET /api/products/featured
// @access Public
router.get("/featured", getFeaturedProducts);

// @desc Get product by ID
// @route GET /api/products/:id
// @access Public
router.get("/:id", getProductById);

module.exports = router;
