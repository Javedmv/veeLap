const productModel = require("../../models/productModel");




const productDetails = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await productModel.findOne({ _id: productId })
            .populate({
                path: 'category',
                model: 'Category'
            })
            .exec()
        console.log(product);
        res.render("user/productdetails", { product, loggedIn: true })
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    productDetails
}