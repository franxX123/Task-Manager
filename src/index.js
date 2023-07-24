const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();
const port = process.env.PORT || 3000;

// NOTE: to parse incoming request to an object
app.use(express.json());

// NOTE: Register routers
app.use(userRouter);
app.use(taskRouter);

app.listen(port, async () => {});
