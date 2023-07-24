const mongoose = require("mongoose");

// NOTE: mongoose is library that build off of mongodb
mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// IMPORTANT: me.save() saves the data created in the User collection and returns a promise
// me.save()
//   .then((data) => {
//     // NOTE: __v property in the returned data is the version of the input
//     console.log(data);
//   })
//   .catch((error) => {
//     // NOTE: error returns a validation object
//     console.log("Error", error);
//   });
