const productModel = require("../../models/productModel");
const userModel = require("../../models/userModel");
const getUserCartAndWishlist = require("../../utils/getUserCartAndWishlist");



const productDetails = async (req, res) => {
    try {
        const productId = req.params.id;
        const loggedIn = req.cookies.loggedIn
        const product = await productModel.findOne({ _id: productId })
            .populate({
                path: 'category',
                model: 'Category'
            })
            .exec()
        let nonrelatedProducts = await productModel.find({ category: product.category._id })
        const relatedProducts = nonrelatedProducts
            .filter(item => item._id != productId)
            .slice(0, 4);

        let userCartAndWishlist = { cartCount: 0, wishlistCount: 0 };
        if(loggedIn){
            const user = await userModel.findOne({email: req.cookies.userEmail});
            userCartAndWishlist = await getUserCartAndWishlist(user?._id);
        }
        res.render("user/productdetails", { product, loggedIn, relatedProducts , userCartAndWishlist})
    } catch (error) {
        console.log(error);
    }
};

const loadRef = async(req,res) => {
    try {
        res.render("user/referalCode")
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    productDetails,
    loadRef
}