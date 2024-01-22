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
        let nonrelatedProducts = await productModel.find({ category: product.category._id })
        const relatedProducts = nonrelatedProducts
            .filter(item => item._id != productId)
            .slice(0, 4)
        res.render("user/productdetails", { product, loggedIn, relatedProducts })
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