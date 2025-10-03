const express = require("express");
const dotenv = require("dotenv").config
const path = require("path")
const cookieParser = require("cookie-parser")


// const session = require("express-session")
const { v4: uuidv4 } = require('uuid');
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// app.use(bodyParser)
app.use(express.static("public"));
// app.use(express.static("public/uploads"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('node_modules'));
app.use(cookieParser());

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});

const adminRoute = require("./routers/adminRouter")
const userRoute = require("./routers/userRouter")
// app.use("/", (req, res, next) => {
//     app.set("views", path.join(__dirname, "views", "admin"));
//     next();
// }, adminRoute)


const mongoose = require("mongoose");
const dbConfig = require("./config/database");


mongoose.connect(dbConfig.url).then(() => {
    console.log("DB connected to MongoDB")
}).catch((err) => {
    console.error(err);
    process.exit();
});

app.use("/admin", adminRoute)
app.use('/', userRoute);

app.listen(process.env.PORT, (err) => {
    if (err) {
        console.error("Error starting server:", err);
    } else {
        console.log(`app is running on http://0.0.0.0:${process.env.PORT}`);
    }
});