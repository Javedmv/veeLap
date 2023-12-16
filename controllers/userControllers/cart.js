const { default: mongoose } = require("mongoose");
const cartModel = require("../../models/cartModel");
const userModel = require("../../models/userModel");
const productModel = require("../../models/productModel");

const loadCart = async (req, res) => {
    try {
        const loggedIn = req.cookies.loggedIn
        if (loggedIn) {
            console.log(loggedIn);
            console.log(req.cookies.loggedIn);
            const userEmail = req.cookies.userEmail
            return res.render("user/shopCart", { loggedIn });
        }
        res.render("user/login", { error: "please login to continue" })
    } catch (error) {
        console.log(error);
    }
};

const addToCart = async (req, res) => {
    try {
        if (req.user) {
            const productId = req.body.productId;
            user = req.user;
            const userData = await userModel.findOne({ email: user });
            const userId = userData._id;
            const product = await productModel.findOne({ _id: productId });

            if (product.stock <= 0) {
                return res.status(200).json({ error: "product is out of stock" });
            } else {

                let userCart = await cartModel.findOne({ userId });
                // if user has a cart
                if (userCart) {
                    const existingProductIndex = userCart.products.findIndex((p) => {
                        return p.productId == productId;
                        // check the type
                    });

                    if (existingProductIndex !== -1) {
                        let productItem = userCart.products[existingProductIndex];
                        productItem.quantity += 1;
                    } else {
                        userCart.products.push({ productId: product._id, quantity: 1 });
                    }
                    // save the changes to the database
                    await userCart.save();
                } else {
                    await cartModel.create({
                        userId: userId,
                        products: [{ productId: product._id, quantity: 1 }]
                    });
                }
                res.status(200).json({ message: "Item Added to Cart" });
            }
        } else {
            console.log("without req.user");
            return res.status(200).json({ error: "User not logged in" });
        }
    } catch (error) {
        console.error(error);
        // Handle error response or logging here
        res.status(500).json({ error: "Internal Server Error" });
    }
};



// return res.status(500).json({ error: "Failed to add the product to the cart" });



module.exports = {
    loadCart,
    addToCart
}






//     .populate({
//         path: '', // to which path you want this data in the cart model
//         model: 'Product'
//     })
//     .exec()

// const user = await userModel.findOne({ email: userEmail })
//     .populate({
//         path: 'userId',
//         model: 'User'
//     })
//     .exec()
// console.log(req.cookies.userEmail);
// console.log(productId);
// console.log(user);
// console.log(product)




// console.log(productId);
// console.log(user);


// if (!userData) {
//     res.status(401).json({ error: "please login to continue" })
// }

//     if (product.stock <= 0) {
//     console.log("this is the stock part");
//     return res.status(200).json({ error: "product is out of stock" });
// }
