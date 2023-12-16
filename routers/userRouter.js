const express = require("express");
const userRouter = express();

const { verifyUser, checkBlockedStatus } = require("../middleware/userAuth")

const { loadLogin, loadSignup, loadHome, sendOtp, verifyOtp, submitSignup, userLogin,
    userLogout, loadForgotPassword, sendOtpForgot, verifyForgotOtp, resetPassword
} = require("../controllers/userControllers/userController")

const { loadCart, addToCart } = require("../controllers/userControllers/cart")

const { productDetails } = require("../controllers/userControllers/product")

// just rendering the pages
userRouter.get("/login", loadLogin);
userRouter.get("/signup", loadSignup);
userRouter.get("/", loadHome);

// forgot password
userRouter.get("/load-forgot-pass", loadForgotPassword);
userRouter.post("/send-otp-forgot", sendOtpForgot)
userRouter.post("/verify-forgot-otp", verifyForgotOtp)
userRouter.post("/reset-password", resetPassword)

// signup 
userRouter.get("/sendotp", sendOtp);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/submit", submitSignup);

// logout
userRouter.get("/logout", userLogout);

// user login
userRouter.post("/login-home", userLogin)  // user account page

// from product.js
userRouter.get("/product-details/:id", productDetails)


// added a middleware of authenticating token
userRouter.use(verifyUser)
// check blocked status
userRouter.use(checkBlockedStatus)


// cart
userRouter.get("/load-cart", loadCart)
userRouter.post("/add-to-cart", addToCart)





module.exports = userRouter