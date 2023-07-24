const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");

// IMPORTANT: Set up the routes and middlewares
// NOTE: User Route operations
router.post("/users", async (req, res) => {
  // NOTE: req.body exist because of the express.json middleware
  const user = new User(req.body);

  try {
    const token = await user.generateAuthToken();
    await user.save();

    res.status(201).send({
      user,
      token,
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

// User logging in
router.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // NOTE: use this when we are performing operations on the collection as a whole
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();

    res.send({
      user,
      token,
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

// User logout
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    // NOTE: request.user is a model instance
    await req.user.save();

    res.send();
  } catch (err) {
    res.status(400).send({
      errMsg: "Something went wrong!",
    });
  }
});

// User logout all users on different devices
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return false;
    });

    // NOTE: request.user is a model instance
    await req.user.save();

    res.send();
  } catch (err) {
    res.status(400).send({
      errMsg: "Something went wrong!",
    });
  }
});

// Get users
router.get("/users/me", auth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update a user
router.patch("/users/me", auth, async (req, res) => {
  const allowedUpdates = ["name", "email", "password", "age"];
  // NOTE: this returns the array of attributes defined in the req.body
  const updates = Object.keys(req.body);

  // NOTE: Returns true if the user is updating existing fields in the document.
  // otherwise false.
  const isValidOperations = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperations) {
    res.status(400).send({
      errMsg: "Non-existing property was used.",
    });
    return;
  }

  try {
    // NOTE: The returned value is a document
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });

    await req.user.save();

    // NOTE: this method directly changes the mongoDB database without going over
    // the save middleware
    // const user = await User.findByIdAndUpdate(_id, req.body, {
    //   // Returns the newly updated document
    //   new: true,
    //   // NOTE: checks if the update result is OK.
    //   runValidators: true,
    // });

    res.send(req.user);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Delete a user
router.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    await req.user.remove();
    res.send(req.user);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
