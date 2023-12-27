const addressModel = require("../../models/addressModel");
const cartModel = require("../../models/cartModel");
const userModel = require("../../models/userModel");

const loadCheckout = async (req, res) => {
    try {
        console.log(req.query);
        const { grandTotal } = req.query
        const loggedIn = req.cookies.loggedIn
        const userData = await userModel.findOne({ email: req.user })
        const userAddress = await addressModel.findOne({ userId: userData._id })
        const userCart = await cartModel.findOne({ userId: userData._id })
            .populate({
                path: "products.productId",
                model: "Product"
            }).exec()
        if (userCart.products.length > 0) {
            return res.render("user/checkout", { loggedIn, userAddress, userCart, grandTotal })
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadCheckout
}