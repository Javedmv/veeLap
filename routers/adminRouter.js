const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const admin_Router = express();
// const session = require("express-session");

const {
    loadAdminLogin,
    verifyAdmin,
    loadDashboard

} = require("../controllers/adminControllers/adminController")

// session

admin_Router.get("/", loadAdminLogin);
admin_Router.post("/verifyAdmin", verifyAdmin);
admin_Router.get("/dashboard", loadDashboard);





module.exports = admin_Router
