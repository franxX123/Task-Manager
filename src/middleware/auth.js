const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    // NOTE: Gets the authorization token
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "thisisSomeprivatekey");

    // NOTE: Find the user with the decoded token
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    console.log(token);

    if (!user) {
      throw new Error({
        errMsg: "User was not found.",
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(400).send({
      errMsg: "Please authenticate user",
    });
  }
};

module.exports = auth;
