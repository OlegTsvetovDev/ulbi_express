require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const db = require("./db/db");
const router = require("./router/router");
const errorMiddleware = require("./middleware/error-middleware");

const PORT = process.env.PORT || 5000;
const DB_PORT = process.env.DB_PORT || 3501;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use("/api", router);

// обработка ошибок последним middleware
app.use(errorMiddleware);

const startApp = async () => {
  try {
    db.connect().then(() => {
      console.log(`DB connected on PORT: ${DB_PORT}`);
      app.listen(PORT, () => {
        console.log(`App started on port: ${PORT}`);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

startApp();
