const express = require("express");
const userRouter = express();



const { loadUserLogin,
    loadUserSignup,
    loadHome,
    loadEmailAuth,
    sendOtp,
    loadOtp,
    verifyOtp,
    resendOtp } = require("../controllers/userControllers/userController")

userRouter.get("/login", loadUserLogin);
userRouter.get("/signup", loadUserSignup);
userRouter.get("/", loadHome);
userRouter.get("/emailAuth", loadEmailAuth);
userRouter.post("/sendOtp", sendOtp);
userRouter.get("/send-Otp", loadOtp)


userRouter.post("/verify-otp", verifyOtp)



module.exports = userRouter