const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();
const PORT = process.env.PORT || 5000;

//Initialize dotenv
dotenv.config();

//Middleware
app.use(cors());
app.use(express.json());

//Connect to MongoDB
connectDB();

//Define Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

//Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
