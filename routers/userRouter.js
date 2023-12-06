const express = require("express");
const userRouter = express();



const { loadLogin,
    loadSignup,
    loadHome,
    sendOtp,
    verifyOtp,
    submitSignup,
    userLogin,
    userLogout

} = require("../controllers/userControllers/userController")

// just rendering the pages
userRouter.get("/login", loadLogin);
userRouter.get("/signup", loadSignup);
userRouter.get("/", loadHome);

// signup 
userRouter.get("/sendotp", sendOtp);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/submit", submitSignup);

// 
userRouter.get("/logout", userLogout);

// user login
userRouter.post("/login-home", userLogin)  // user account page






module.exports = userRouter