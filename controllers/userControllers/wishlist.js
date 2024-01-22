const cartModel = require("../../models/cartModel");
const productModel = require("../../models/productModel");
const userModel = require("../../models/userModel");
const walletModel = require("../../models/walletModel");
const wishlistModel = require("../../models/wishlistModel");


const loadWishlist = async (req, res) => {
    try {
        const loggedIn = req.cookies.loggedIn
        const userData = await userModel.findOne({ email: req.user })
        const wishlist = await wishlistModel.findOne({ userId: userData._id })
            .populate({
                path: 'products.productId', model: 'Product'
            })
            .exec()
        res.render("user/wishlist", { loggedIn, wishlist })
    } catch (error) {
        console.log(error);
    }
}

const addToWishlist = async (req, res) => {
    try {
        const productId = req.query.productId;
        const userData = await userModel.findOne({ email: req.user })
        const product = await productModel.findOne({ _id: productId })

        const userWishlist = await wishlistModel.findOne({ userId: userData._id })
        if (userWishlist) {
            let productIndex = userWishlist.products.findIndex((product) => {
                return product.productId == productId;
            });

            if (productIndex === -1) {
                console.log("new product");
                userWishlist.products.push({ productId });
                await userWishlist.save();
            }
        } else {
            console.log("new wishlist");
            const newWishlist = new wishlistModel({ userId: userData._id })
            await newWishlist.save()
            newWishlist.products.push({ productId })
            await newWishlist.save()

        }
        res.status(200).json({ message: "Added to Wishlist" })

    } catch (error) {
        console.log(error);
    }
}

const deleteWishlist = async (req, res) => {
    try {
        const wishlistId = req.query.product
        const userData = await userModel.findOne({ email: req.user })
        const wishlist = await wishlistModel.findOneAndUpdate(
            { userId: userData._id },
            { $pull: { products: { _id: wishlistId } } },
            { new: true }
        );
        res.redirect("/user/load-wishlist")
    } catch (error) {
        console.log(error);
    }
}

const addToCartWishlist = async (req, res) => {
    try {
        const wishlistId = req.query.wishlistId
        const productId = req.query.productId
        const userData = await userModel.findOne({ email: req.user })
        const product = await productModel.findOne({ _id: productId })
        const wishlist = await wishlistModel.findOneAndUpdate(
            { userId: userData._id },
            { $pull: { products: { _id: wishlistId } } },
            { new: true }
        )
        const userCart = await cartModel.findOne({ userId: userData._id })
        console.log(userCart);
        let productExsist = true;
        if (userCart) {
            for (let item of userCart.products) {
                if (item.productId == productId) {
                    productExsist = false
                }
            }
        }
        if (productExsist) {
            userCart.products.push({
                productId,
                quantity: 1
            })
            userCart.save();
        }
        res.status(200).json({ message: "Product Added To Cart Successfully" })
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadWishlist,
    addToWishlist,
    deleteWishlist,
    addToCartWishlist
}