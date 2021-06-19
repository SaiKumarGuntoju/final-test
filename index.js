const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());
let database = null;
const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: path.join(__dirname, "twitterClone.db"),
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at Port 3000");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//middleware function

const authenticateToken = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  } else {
    response.status(401);
    response.send("Invalid JWT Token");
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "SECRET", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        next();
      }
    });
  }
};

//registering user in the Database

app.post("/register/", async (request, response) => {
  const { username, password, name, gender } = request.body;
  const isUserRegisteredQuery = `
            SELECT *
            FROM user
            WHERE username = '${username}';`;
  const isUserRegistered = await database.get(isUserRegisteredQuery);
  if (isUserRegistered === undefined) {
    if (password.length < 6) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const createUserQuery = `
            INSERT INTO user
            (name,username,password,gender)
            VALUES 
           ( '${name}',
           '${username}',
            '${hashedPassword}',
            '${gender}')
            `;
      await database.run(createUserQuery);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

//login the user

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const isUserFoundQuery = `
            SELECT * 
            FROM user
            WHERE username = '${username}';`;
  const isUserFound = await database.get(isUserFoundQuery);
  if (isUserFound === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(
      password,
      isUserFound.password
    );
    if (isPasswordMatched === true) {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, "SECRET");
      response.send({ jwtToken });
      //console.log({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});


//API TO DELETE THE STUDENT BASED ON STUDENT_ID 

app.delete("/student/:studentId/", async (request,response) => { 
    const {student_id} = request.params;
    const deleteStudentQuery = `
        DELETE FROM 
            student_table
        WHERE 
            student_id = ${studentId};`;
    await database.run(deleteStudentQuery);
    response.send("Student is  Removed")
})

app.delete("/student/:studentId/", async (request,response) => { 
    const {student_id} = request.params;
    const deleteStudentQuery = `
        DELETE FROM 
            student_table
        WHERE 
            student_id = ${studentId};`;
    await database.run(deleteStudentQuery);
    response.send("Student is  Removed")
})
app.delete("/student/:studentId/", async (request,response) => { 
    const {student_id} = request.params;
    const deleteStudentQuery = `
        DELETE FROM 
            student_table
        WHERE 
            student_id = ${studentId};`;
    await database.run(deleteStudentQuery);
    response.send("Student is  Removed")
})

module.exports = app;



