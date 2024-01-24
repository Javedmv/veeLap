const express = require("express");
const userRouter = express();

const { verifyUser, checkBlockedStatus } = require("../middleware/userAuth")

const { loadLogin, loadSignup, loadHome, sendOtp, verifyOtp, submitSignup, userLogin,
    userLogout, loadForgotPassword, sendOtpForgot, verifyForgotOtp, resetPassword, editUserDetails,submitReferal
} = require("../controllers/userControllers/userController")

const { loadCart, addToCart, removeProductFromCart, clearAllCart, updateQuantity } = require("../controllers/userControllers/cart")

const { productDetails,loadRef } = require("../controllers/userControllers/product")

const { filterAndSort, searchProduct, aboutPage, loadSalesPage } = require("../controllers/userControllers/filterAndSort")

const { loadUserProfile, loadAddAddress, submitAddress, loadEditAddress, postEditAddress, deleteAddress, loadOrderDetails, cancelOrder, returnOrder, singleCancelOrder, submitReferral } = require("../controllers/userControllers/profile")

const { loadCheckout, applyCoupon } = require("../controllers/userControllers/checkout")

const { loadOrderSuccess, placeOrderCOD, walletPayment, paymentRazorpay, updatePaymentStatus } = require("../controllers/userControllers/payment")

const { loadWishlist, addToWishlist, deleteWishlist, addToCartWishlist } = require("../controllers/userControllers/wishlist")
// just rendering the pages
userRouter.get("/login", loadLogin);
userRouter.get("/signup", loadSignup);
userRouter.get("/", loadHome);

//referal
userRouter.get("/referalCode",submitReferal)
userRouter.get("/ref",loadRef)
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
userRouter.get("/about", aboutPage)
userRouter.get("/sales-page", loadSalesPage)
userRouter.post("/search", searchProduct)

userRouter.post("/add-to-cart", addToCart)
// added a middleware of authenticating token
userRouter.use(verifyUser)
// check the autherization of the client
userRouter.use(checkBlockedStatus)


// cart
userRouter.get("/load-cart", loadCart)
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
userRouter.post("/referral", submitReferral)

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
userRouter.post("/single-cancel-order", singleCancelOrder)

//wishlist
userRouter.get("/load-wishlist", loadWishlist)
userRouter.post("/add-to-wishlist", addToWishlist)
userRouter.get("/delete-product", deleteWishlist)
userRouter.post("/add-to-cart-wishlist", addToCartWishlist)
module.exports = userRouter