// CRUD operations
// IMPORTANT: Before running or us T3 Studio, first run the mongod.exe using the command below to start up the
// database server on the local machine:
// '& "C:/Users/Francis Dave/mongodb/bin/mongod.exe" --dbpath="/Users/Francis Dave/mongodb-data"'
// This will allow T3 Studio to see if there is a database server running.

// IMPORTANT MongoDB CRUD operations: https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertMany
// Connects the backend server to the database server

// NOTE:
// The structure of a mongo database: db -> collection -> document -> fields

const mongoDB = require("mongodb");
const { MongoClient, ObjectID } = mongoDB;

// const id = new ObjectID();
// console.log(id.getTimestamp());

const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager";

MongoClient.connect(
  connectionURL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (error, client) => {
    if (error) {
      console.log("Unable to connect to Mongo database.");
      return;
    }

    // create database
    const db = client.db(databaseName);

    db.collection("tasks")
      .deleteOne({
        task: "Feed the pigeons porkchops",
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log("There was a problem deleting the tasks.");
      });
  }
);
