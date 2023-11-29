const express = require("express");
const userRouter = express();



const { loadLogin,
    loadSignup,
    loadHome,
    sendOtp,
    verifyOtp,
    submitSignup
} = require("../controllers/userControllers/userController")

userRouter.get("/login", loadLogin);
userRouter.get("/signup", loadSignup);
userRouter.get("/", loadHome);
userRouter.get("/sendotp", sendOtp)
userRouter.post("/verify-otp", verifyOtp)
userRouter.post("/submit", submitSignup)
module.exports = userRouter