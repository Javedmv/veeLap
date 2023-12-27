const { default: mongoose } = require("mongoose");
const cartModel = require("../../models/cartModel");
const userModel = require("../../models/userModel");
const productModel = require("../../models/productModel");

const loadCart = async (req, res) => {
    try {
        const loggedIn = req.cookies.loggedIn
        if (loggedIn) {
            const userEmail = req.cookies.userEmail
            const userData = await userModel.findOne({ email: userEmail })
            const products = await cartModel.findOne({ userId: userData._id })
                .populate({
                    path: 'products.productId', model: 'Product'
                })//  the field is named 'category' in your products schema
                .exec()
            // console.log(products);1``1111111111`
            let grandTotal = 0;

            for (let i = 0; i < products.products.length; i++) {
                grandTotal = grandTotal + products.products[i].productId.salesPrice * products.products[i].quantity
            }
            return res.render("user/cart", { loggedIn, products, grandTotal });
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
            let product = await productModel.findOne({ _id: productId });

            if (product.stock <= 0) {
                return res.status(200).json({ error: "product is out of stock" });
            } else {

                let userCart = await cartModel.findOne({ userId });
                // if user has a cart
                if (userCart) {
                    const existingProductIndex = userCart.products.findIndex((p) => {
                        return p.productId.toString() == product._id;
                        // check the type
                    });

                    if (existingProductIndex !== -1) {
                        let productItem = userCart.products[existingProductIndex];
                        productItem.quantity += 1;
                        console.log("again added to cart okay");
                        return res.status(200).json({ productExsist: true })
                    } else {
                        userCart.products.push({ productId: product._id, quantity: 1 });
                        console.log("first time");
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
            return res.status(200).json({ notUser: true });
        }
    } catch (error) {
        console.error(error);
        // Handle error response or logging here
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const removeProductFromCart = async (req, res) => {
    try {
        const userCartId = req.query.userId
        const userEmail = req.cookies.userEmail
        const userData = await userModel.findOne({ email: userEmail });

        // const userCartDetails = await cartModel.findOne({ userId:  });
        const updateProduct = await cartModel.updateOne({ userId: userData._id }, {
            $pull: {
                products: {
                    _id: userCartId
                }
            }
        })
        res.redirect("/user/load-cart")
    } catch (error) {
        console.log(error);
    }
}

const clearAllCart = async (req, res) => {
    try {
        const userEmail = req.cookies.userEmail
        const userData = await userModel.findOne({ email: userEmail })
        const deletedProduct = await cartModel.updateOne({ userId: userData._id }, { $pull: { products: {} } })
        res.redirect("/user/load-cart")
    } catch (error) {
        console.log(error);
    }
}

const updateQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body
        const email = req.user
        const userData = await userModel.findOne({ email });
        const userCart = await cartModel.findOne({ userId: userData._id });
        for (const item of userCart.products) {
            console.log("inside");
            if (item._id == productId) {
                await cartModel.updateOne({ userId: userData._id, "products._id": productId },
                    { $set: { "products.$.quantity": quantity } });
            }
        }
        if (userCart) {
            res.json({ data: { productId, quantity: quantity } })
        } else {
            console.log(error);
        }
    } catch (error) {
        console.log("error in updating quantity", error);
    }
}

// return res.status(500).json({ error: "Failed to add the product to the cart" });



module.exports = {
    loadCart,
    addToCart,
    removeProductFromCart,
    clearAllCart,
    updateQuantity
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

// const addToCart = async (req, res) => {
//     try {
//         if (req.user) {
//             const productId = req.body.productId;
//             user = req.user;
//             const userData = await userModel.findOne({ email: user });
//             const userId = userData._id;
//             const product = await productModel.findOne({ _id: productId });

//             if (product.stock <= 0) {
//                 return res.status(200).json({ error: "product is out of stock" });
//             } else {

//                 let userCart = await cartModel.findOne({ userId });
//                 // if user has a cart
//                 if (userCart) {
//                     const existingProductIndex = userCart.products.findIndex((p) => {
//                         return p.productId == productId;
//                         // check the type
//                     });

//                     if (existingProductIndex !== -1) {
//                         let productItem = userCart.products[existingProductIndex];
//                         productItem.quantity += 1;
//                     } else {
//                         userCart.products.push({ productId: product._id, quantity: 1 });
//                     }
//                     // save the changes to the database
//                     await userCart.save();
//                 } else {
//                     await cartModel.create({
//                         userId: userId,
//                         products: [{ productId: product._id, quantity: 1 }]
//                     });
//                 }
//                 const qq = await cartModel.find({})
//                 console.log(qq);
//                 res.status(200).json({ message: "Item Added to Cart" });
//             }
//         } else {
//             console.log("without req.user");
//             return res.status(200).json({ error: "User not logged in" });
//         }
//     } catch (error) {
//         console.error(error);
//         // Handle error response or logging here
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };



// vahid
// deleteProductFromCart: async (req, res, next) => {
//     try {
//       const userId = req.session.userId;
//       const productId = req.query.productId;

//       let cart = await cartModel.findOne({ user: userId });
//       if (!cart) {
//         const error = new Error("Cart is yet to create for this user");
//         error.status(404);
//         throw error;
//       }
//       let cartItems = cart.cartItems;
//       cartItems = cartItems.filter(
//         (_) => String(_.product) !== String(productId)
//       );
//       await cartModel.findOneAndUpdate(
//         { user: userId },
//         { $set: { cartItems: cartItems } },
//         { new: true }
//       );

//       res.redirect("/viewCart");
//     } catch (err) {
//       console.error(err.message);
//       next(err);
//     }
//   },