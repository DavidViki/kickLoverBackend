const mongoose = require("mongoose");

const orderItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: Number, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

const orderStatuses = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentDetails: {
      method: { type: String, required: true },
      transactionId: { type: String, required: true },
      status: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending",
      },
    },
    discount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: Object.values(orderStatuses),
      default: orderStatuses.PENDING,
      required: true,
    },
    confirmedAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.methods.calculateTotalPrice = function () {
  this.totalPrice = this.orderItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

orderSchema.pre("save", function (next) {
  this.calculateTotalPrice();
  if (this.isModified("orderStatus")) {
    switch (this.orderStatus) {
      case orderStatuses.CONFIRMED:
        this.confirmedAt = new Date();
        break;
      case orderStatuses.SHIPPED:
        this.shippedAt = new Date();
        break;
      case orderStatuses.DELIVERED:
        this.deliveredAt = new Date();
        break;
      case orderStatuses.CANCELLED:
        this.cancelledAt = new Date();
        break;
      default:
        break;
    }
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
