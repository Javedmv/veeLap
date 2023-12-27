const addressModel = require("../../models/addressModel");
const cartModel = require("../../models/cartModel");
const userModel = require("../../models/userModel");
const productModel = require("../../models/productModel");
const orderModel = require("../../models/orderModel")
const { v4: uuidv4 } = require("uuid");


const loadOrderSuccess = async (req, res) => {
    try {
        const loggedIn = req.cookies.loggedIn
        res.render("user/orderSuccess", { loggedIn })
    } catch (error) {
        console.log(error);
    }
}
const placeOrderCOD = async (req, res) => {
    // const { addressId, grandTotal } = req.query
    // const userAddress = await addressModel.findOne({ "address._id": addressId }, { "address.$": 1 })
    try {
        console.log(req.query);
        const { grandTotal, addressId } = req.query
        const loggedIn = req.cookies.loggedIn
        const userData = await userModel.findOne({ email: req.user })
        const userAddress = await addressModel.findOne({ userId: userData._id })
        const userCart = await cartModel.findOne({ userId: userData._id })
            .populate({
                path: "products.productId",
                model: "Product"
            }).exec()
        let orderTotal = 0;//total amount
        let orderProducts = [];
        for (const item of userCart.products) {
            if (item.productId.stock < item.quantity) {
                return res.status(200).json({ codOutOfStock: true })
            }

            const orderedItem = {
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productId.salesPrice * item.quantity
            }
            await productModel.updateOne({ _id: orderedItem.productId }, { $inc: { stock: -orderedItem.quantity } })
            orderTotal += orderedItem.price * orderedItem.quantity
            console.log("this is ordered item");
            console.log(orderedItem);
            console.log("end");
            orderProducts.push(orderedItem)
        }
        let delAddress;
        userAddress.address.forEach((address) => {
            if (addressId == address._id) {
                delAddress = {
                    addressType: address.addressType,
                    name: address.name,
                    city: address.city,
                    landMark: address.landMark,
                    state: address.state,
                    pincode: address.pincode,
                    phone: address.phone
                }
            }
        })
        const newOrder = await orderModel.create({
            userId: userCart.userId._id,
            products: orderProducts,
            orderDate: Date.now(),
            totalAmount: orderTotal,
            referenceId: uuidv4(),
            orderStatus: "Order Placed",
            paymentStatus: "Pending",
            paymentMethod: "Cash on delivery",
            address: delAddress
        })
        await newOrder.save()
        await cartModel.updateOne({ userId: userData._id }, { $set: { products: [] } });
        return res.status(200).json({ codOutOfStock: false })
        // res.render("user/checkout", { loggedIn, userAddress, userCart, grandTotal })
    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    loadOrderSuccess,
    placeOrderCOD
}

