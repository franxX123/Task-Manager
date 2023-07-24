const express = require("express");
const auth = require("../middleware/auth");
// NOTE: Create the router
const router = express.Router();
const Task = require("../models/task");

// NOTE: Set up the routes in the router. TASK routes
// POST a task
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

// GET Tasks
// queries: completed, limit => number of items to take from the current skip
// , skip => item number to start from (inclusive)
// GET /tasks?limit=limitValue&skip=skipValue
// GET /tasks?sortBy=createdAt:"desc or asc"
router.get("/tasks", auth, async (req, res) => {
  try {
    let match = {};
    let sort = {};
    const { completed, limit, skip, sortBy } = req.query;

    if (completed) {
      match.completed = completed === "true";
    }

    if (sortBy) {
      const parts = sortBy.split(":");
      sort[parts[0]] = parts[1] === "asc" ? 1 : -1;
      console.log(sort);
    }

    // NOTE: Use the virtual property to produce all the tasks from user
    await req.user
      .populate({
        path: "tasks",
        match,
        // NOTE: options allow us to specify how the collection of tasks will be delivered.
        options: {
          // NOTE: mongoose ignores if limit is not a number
          limit: +limit,
          skip: +skip,
          // NOTE: for sort we specify the field with a value of -1 (descending) or 1 (descending)
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (err) {
    res.status(500).send(err);
  }
});

// GET a Task
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    // const task = await Task.findById(_id);
    const task = await Task.findOne({
      _id,
      owner: req.user._id,
    });

    if (!task) {
      res.status(404).send({
        errMsg: "Could not find task!",
      });
      return;
    }

    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update a task
router.patch("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  // check if the field to update is allowed
  const allowedUpdates = ["description", "completed"];
  const updates = Object.keys(req.body);
  const isValidUpdate = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidUpdate) {
    return res.status(400).send({
      errMsg: "Invalid update field",
    });
  }

  try {
    const task = await Task.findOne({
      _id,
      owner: req.user._id,
    });

    // NOTE: this method bypasses the .save middleware; thus, middleware that build
    // on .save() are also bypassed
    // const updatedDoc = await Task.findByIdAndUpdate(_id, req.body, {
    //   new: true,
    //   // check if the value for the field is correct
    //   runValidators: true,
    // });

    // if the doc doesn't exist
    if (!task) {
      res.status(400).send({
        errMsg: "The document you want to update doesn't exists.",
      });
      return;
    }

    updates.forEach((update) => {
      task[update] = req.body[update];
    });

    await task.save();

    // send the updated document after update is done
    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete Tasks
router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    await task.remove();

    if (!task) {
      return res.status(404).send({
        errMsg: "The task does not exists.",
      });
    }

    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
