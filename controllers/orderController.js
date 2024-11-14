const Order = require("../models/Order");
const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");

/**
 * @desc Create a new order
 * @route POST /api/orders
 * @access Private (User must be logged in)
 */
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, paymentDetails } =
    req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items found");
  }

  // Check stock availability
  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Use Map's get method to access size's quantity
    const sizeQuantity = product.sizes.get(item.size);

    if (!sizeQuantity || sizeQuantity < item.quantity) {
      res.status(400);
      throw new Error(`Not enough stock for ${product.name} size ${item.size}`);
    }
  }

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    paymentDetails,
    totalPrice: orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    ),
  });

  const createdOrder = await order.save();

  // Update product stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (product) {
      const sizeQuantity = product.sizes.get(item.size);
      product.sizes.set(item.size, sizeQuantity - item.quantity); // Reduce the quantity
      await product.save();
    }
  }

  res.status(201).json(createdOrder);
});

/**
 * @desc Get all orders (Admin)
 * @route GET /api/orders
 * @access Private (Admin only)
 */
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "id name")
    .sort({ createdAt: -1 });
  res.json(orders);
});

/**
 * @desc Get order by ID
 * @route GET /api/orders/:id
 * @access Private (User must be logged in)
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "id name");

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

/**
 * @desc Update order status
 * @route PUT /api/orders/:id
 * @access Private (Admin only)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { newStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prevent changing status if it's already cancelled
    if (order.orderStatus === "Cancelled") {
      return res
        .status(400)
        .json({ message: "Cannot update a cancelled order" });
    }

    // Set the new status (pre-save hook will handle timestamps)
    order.orderStatus = newStatus;

    await order.save();

    res.json({ message: `Order status updated to ${newStatus}`, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Delete an order
 * @route DELETE /api/orders/:id
 * @access Private (Admin only)
 */
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    await Order.deleteOne({ _id: order._id });
    res.json({ message: "Order removed" });
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

/**
 * @desc Get user's orders
 * @route GET /api/orders/my-orders
 * @access Private (User must be logged in)
 */
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({
    createdAt: -1,
  });

  if (orders) {
    res.json(orders);
  } else {
    res.status(404);
    throw new Error("No orders found for this user");
  }
});

/**
 * @desc Cancel an order if it is still pending or confirmed
 * @route PUT /api/orders/:id/cancel
 * @access Private (User only if order status is Pending or Confirmed)
 */
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order status is eligible for cancellation
    if (order.orderStatus !== "Pending" && order.orderStatus !== "Confirmed") {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled at this stage" });
    }

    // Update order status to 'Cancelled' and set cancellation date
    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        // Access the `sizes` Map for the product
        const currentQuantity = product.sizes.get(String(item.size)) || 0;
        product.sizes.set(String(item.size), currentQuantity + item.quantity); // Update the stock

        await product.save(); // Save product with updated stock
      }
    }
    await order.save(); // Save the cancelled order

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  deleteOrder,
  getUserOrders,
  cancelOrder,
  updateOrderStatus,
};
