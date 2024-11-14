const jwt = require("jsonwebtoken");

const generateToken = (id, admin) => {
  return jwt.sign({ id, admin }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
