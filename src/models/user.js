const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("../models/task");

// Create a schema. This is done by mongoose by default
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value) {
        if (
          validator.contains(
            value,
            "password",
            (options = { ignoreCase: true })
          )
        ) {
          throw new Error("The password must not contain the 'password'.");
        }
      },
    },
    email: {
      type: String,
      // NOTE: "unique" allows us to make sure the email field is always different
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("The email provided is invalid!");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      // NOTE: takes the age being passed
      validate(value) {
        if (value < 0) {
          throw new Error("Age passed is negative.");
        }
      },
    },
    // NOTE: this is to allow other the user to access their account on multiple devices
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    // NOTE: lets us keep track of the documents with timestamps:
    // createdAt and updateAt
    timestamps: true,
  }
);

// NOTE: a virtual doesn't do anything to the User model
userSchema.virtual("tasks", {
  // IMPORTANT: you read this as from "ref" (collection) there is a
  // a field "foreignField" whose value is the current model's "local"
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

// NOTE: these are called instance methods if defined in the methods of the schema
// IMPORTANT: toJSON is ran before JSON.stringify when sending back data
userSchema.methods.toJSON = function () {
  const user = this;
  // NOTE: copies an object to prevent in-place field removal
  const userObject = user.toObject();
  console.log(userObject);

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

// NOTE: these are called instance methods if defined in the methods of the schema
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "thisisSomeprivatekey"); // NOTE: this is not asynchronous
  user.tokens.push({ token });
  await user.save();

  return token;
};

// NOTE: statics property allows us to use some functions defined in the
// model. This are called model methods
// fes - checks if the password and email exist in the database
userSchema.statics.findByCredentials = async (email, password) => {
  // NOTE: Assume we only register 1 account per email
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error({ errMsg: "Login failed" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error({ errMsg: "Login failed" });
  }

  return user;
};

// NOTE: this is a prehook that calls a function before saving
userSchema.pre("save", async function (next) {
  const user = this;
  const salt = 8;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, salt);
  }

  // NOTE: this goes to the next middleware; otherwise it is stuck here
  next();
});

// NOTE: Creates a middleware that is invoked before a user is removed
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({
    owner: user._id,
  });

  next();
});

// Create a model
const User = mongoose.model("User", userSchema);

module.exports = User;
