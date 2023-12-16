const productModel = require("../../models/productModel");
const userModel = require("../../models/userModel");



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

        // console.log(product);
        res.render("user/productdetails", { product, loggedIn })
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    productDetails
}