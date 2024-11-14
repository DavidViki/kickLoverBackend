const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

// @desc Add a new product
// @route POST /api/products
// @access Private/Admin
const addProduct = asyncHandler(async (req, res) => {
  const { brand, name, description, price, imageUrl, category, sizes } =
    req.body;

  // Check if all required fields are provided
  if (!brand || !name || !price || !imageUrl || !category || !sizes) {
    res.status(400).json({ message: "Please provide all required fields" });
    return;
  }

  // Create a new product
  const product = await Product.create({
    brand,
    name,
    description,
    price,
    imageUrl,
    category,
    sizes,
  });

  res.status(201).json({
    product,
  });
});

// @desc Update an existing product
// @route PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { brand, name, description, price, imageUrl, category, sizes } =
    req.body;

  //Find the product
  const product = await Product.findById(id);

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  // Update the product details
  product.brand = brand || product.brand;
  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.imageUrl = imageUrl || product.imageUrl;
  product.category = category || product.category;
  product.sizes = sizes || product.sizes;

  await product.save();

  res.json({
    product,
  });
});

// @desc Restock an existing product
// @route PATCH /api/products/restock
// @access Private/Admin
const restockProduct = async (req, res) => {
  const { productId, sizes } = req.body;

  try {
    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // Iterate through each size in the request body
    for (const [size, quantity] of Object.entries(sizes)) {
      // Check if the size already exists in the product
      const currentStock = product.sizes.get(size) || 0; // If size doesn't exist, set to 0

      // Add the new quantity to the current stock
      const updatedStock = currentStock + Number(quantity);

      // Update the product's size map
      product.sizes.set(size, updatedStock);
    }

    // Save the updated product
    await product.save();

    res
      .status(200)
      .json({ message: "Product restocked successfully", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error restocking product", error: error.message });
  }
};

// @desc Delete a product
// @route DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find product by ID and delete it
  const deletedProduct = await Product.findByIdAndDelete(id);

  // If no product is found, send a 404 response
  if (!deletedProduct) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Send success response
  res.status(200).json({ message: "Product deleted successfully" });
});

// @desc Get all products
// @route GET /api/products
// @access Public
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});

  res.json({
    products,
  });
});

// @desc Get products by category
// @route GET /api/products/category/:category
// @access Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const products = await Product.find({ category });

  if (!products.length) {
    res.status(404).json({ message: "No products found for this category" });
    return;
  }

  res.json({
    products,
  });
});

// @desc Get products by brand
// @route GET /api/products/brand/:brand
// @access Public
const getProductsByBrand = asyncHandler(async (req, res) => {
  const { brand } = req.params;
  const products = await Product.find({ brand });

  if (!products.length) {
    res.status(404).json({ message: "No products found for this brand" });
    return;
  }

  res.json({
    products,
  });
});

// @desc Get product by ID
// @route GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  res.json({
    product,
  });
});

// @desc Get featured products
// @route GET /api/products/featured
// @access Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  // Fetch 10 products from the database
  const products = await Product.find().limit(10);

  // Check if products were found
  if (!products.length) {
    return res.status(404).json({ message: "No products found" });
  }

  // Send the products back to the client
  res.json(products);
});

module.exports = {
  addProduct,
  updateProduct,
  restockProduct,
  deleteProduct,
  getAllProducts,
  getProductsByCategory,
  getProductsByBrand,
  getProductById,
  getFeaturedProducts,
};
