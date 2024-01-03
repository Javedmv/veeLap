const express = require("express");
const userRouter = express();

const { verifyUser, checkBlockedStatus } = require("../middleware/userAuth")

const { loadLogin, loadSignup, loadHome, sendOtp, verifyOtp, submitSignup, userLogin,
    userLogout, loadForgotPassword, sendOtpForgot, verifyForgotOtp, resetPassword, editUserDetails
} = require("../controllers/userControllers/userController")

const { loadCart, addToCart, removeProductFromCart, clearAllCart, updateQuantity } = require("../controllers/userControllers/cart")

const { productDetails } = require("../controllers/userControllers/product")

const { filterAndSort, searchProduct } = require("../controllers/userControllers/filterAndSort")

const { loadUserProfile, loadAddAddress, submitAddress, loadEditAddress, postEditAddress, deleteAddress, loadOrderDetails, cancelOrder, returnOrder, singleCancelOrder } = require("../controllers/userControllers/profile")

const { loadCheckout, applyCoupon } = require("../controllers/userControllers/checkout")

const { loadOrderSuccess, placeOrderCOD, walletPayment, paymentRazorpay, updatePaymentStatus } = require("../controllers/userControllers/payment")
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

//filter and sort products
userRouter.post("/filter-sort", filterAndSort)

// added a middleware of authenticating token
userRouter.use(verifyUser)
// check blocked status
userRouter.use(checkBlockedStatus)


// cart
userRouter.get("/load-cart", loadCart)
userRouter.post("/add-to-cart", addToCart)
userRouter.get("/delete-cart", removeProductFromCart)
userRouter.get("/clear-all-cart", clearAllCart)
userRouter.post("/update-quantity", updateQuantity)


//profile
userRouter.get("/profile", loadUserProfile)
userRouter.get("/add-address", loadAddAddress)
userRouter.post("/submit-address", submitAddress)
userRouter.get("/edit-address/:id", loadEditAddress)
userRouter.post("/submit-edit-address/:id", postEditAddress)
userRouter.get("/delete-single-address/:id", deleteAddress)
userRouter.get("/order-status-details", loadOrderDetails)
userRouter.post("/edit-user-details", editUserDetails)
//checkout
userRouter.get("/checkout", loadCheckout)
userRouter.get("/order/success", loadOrderSuccess)
userRouter.post("/placeorder/cod", placeOrderCOD)
userRouter.get("/applycoupon", applyCoupon)
userRouter.post("/pay-wallet", walletPayment)
userRouter.post("/pay-razorpay", paymentRazorpay)
userRouter.post("/update-payment-status", updatePaymentStatus)

//order
userRouter.get("/cancel-order/:id", cancelOrder)
userRouter.get("/return-order/:id", returnOrder)
userRouter.get("/search", searchProduct)
userRouter.post("/single-cancel-order", singleCancelOrder)

module.exports = userRouter