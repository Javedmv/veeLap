const addressModel = require("../../models/addressModel");
const cartModel = require("../../models/cartModel");
const couponModel = require("../../models/couponModel");
const userModel = require("../../models/userModel");
const walletModel = require("../../models/walletModel");
const getUserCartAndWishlist = require("../../utils/getUserCartAndWishlist");

const loadCheckout = async (req, res) => {
    try {
        let { grandTotal } = req.query
        const loggedIn = req.cookies.loggedIn
        const _id = req.user?._id
        const userAddress = await addressModel.findOne({ userId: _id });
        const coupons = await couponModel.find({
            minimumPurchase: { $lt: grandTotal },
            status: "Unblock",
            expiryDate: { $gt: new Date() }
        })
        const wallet = await walletModel.findOne({ userId: _id });
        const userCart = await cartModel.findOne({ userId: _id })
            .populate({
                path: "products.productId",
                model: "Product"
            }).exec()
        const stockCheck = userCart.products.every(productItem => {
            return productItem.productId.stock >= productItem.quantity;
        });

        const statusCheck = userCart.products.every(productItem => {
            return productItem.productId.productStatus !== 'Inactive';
        });
        if (!stockCheck || !statusCheck) {
            // Redirect to cart if productStock is insufficient
            return res.redirect('/load-cart');
        }
        let userCartAndWishlist = { cartCount: 0, wishlistCount: 0 };
        if(loggedIn){
            userCartAndWishlist = await getUserCartAndWishlist(_id);
        }
        if (userCart.products.length > 0) {
            return res.render("user/checkout", { loggedIn, userAddress, userCart, grandTotal, coupons ,userCartAndWishlist})
        }
    } catch (error) {
        console.log(error);
    }
}
const applyCoupon = async (req, res) => {
    try {
        const { Total, code } = req.query
        // console.log(Total);
        const {_id} = req.user
        const wallet = await walletModel.findOne({ userId: _id });
        let grandTotal = 0;
        const userCart = await cartModel.findOne({ userId: _id })
            .populate({
                path: "products.productId",
                model: "Product"
            })
            .exec()
        if (userCart && userCart.products.length > 0) {
            for (let i = 0; i < userCart.products.length; i++) {
                if (userCart.products[i].quantity > userCart.products[i].productId.stock || userCart.products[i].productId.stock == 0) {
                    return res.redirect('/load-cart')
                }
                grandTotal += userCart.products[i].quantity * (userCart.products[i].productId.salesPrice - userCart.products[i].productId.offerAmount);
            }
        } else {
            return res.redirect('/load-cart')
        }
        const coupon = await couponModel.findOne({ couponCode: code })
        if (!coupon) {
            return res.status(200).json({ error: "invalid Coupon" })
        }
        if (coupon.status != "Unblock") {
            return res.status(200).json({ error: "Coupon is blocked" })
        }
        if (coupon.expiryDate < new Date()) {
            return res.status(200).json({ error: "Coupon is expired" });
        }
        if (coupon.redeemedUser.includes(_id)) {
            return res.status(200).json({ error: "Coupon has already been redeemed" });
        }
        const updatedTotal = grandTotal - coupon.discountAmount;

        const discountAmount = coupon.discountAmount

        return res.status(200).json({ message: "Coupon has been applied", updatedTotal, code, grandTotal, discountAmount });
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadCheckout,
    applyCoupon
}