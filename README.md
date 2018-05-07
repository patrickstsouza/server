# Location quiz server

This repository hosts the service of the Location Quiz App done as coursework of Web and Mobile GIS - Apps and Programming course in UCL.
The server is the bridge between the quiz app, the question configuration webpage and the database.

# Related repositories:

* Questions: https://github.com/patrickstsouza/questions
* Quiz: https://github.com/patrickstsouza/quiz

# Installation

1. Clone this repository and cd into the cloned folder:
```
git clone https://github.com/patrickstsouza/server
cd server
```

2. Install npm dependencies:
```
npm install
```

3. Create a database connection file called ```postGISConnection.js``` that contains the database connection information in the format:
```
host: {host},
user: {user},
database: {database},
password: {password},
port: {port}
```
This file will be used to connect to the database.

4. Create the tables in the database by executing the SQL script ```database.sql``` in the database.

# Running

You can run the server by typing in the command line:
```
node httpServer.js
```

The server will then initialize and wait for requests from both the questions web app and the quip phone app. It will log each request to the terminal.

If you want to keep the server running even if you disconnect from the console, you can type
```
nohup node httpServer.js &
```