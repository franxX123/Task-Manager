# Task-Manager
Task Manager is a REST API endpoint designed for managing a list of tasks that a person must do (i.e., a Todo List). This application enables the client to execute standard HTTP methods (GET, POST, PUT, DELETE, etc.) and perform CRUD (Create, Read, Update, Delete) operations on resources stored in a local MongoDB database server.

# Get Started
1.) Install MongoDB and MongoDBCompass into your machine. Then, open MongoDB Compass, create a new connection, and paste in the uri textfield the following: "mongodb://localhost:27017". Then connect to the server.

2.) Then, in the project folder, open the terminal and type the command "npm install" to install all dependencies.

3.) To run the application do: npm run dev

4.) To test the API endpoints the user can install Postman or some other API testing tool you prefer. To see the list of endpoints for the Users and Tasks please take a look at the Routers folder in the src directory.
