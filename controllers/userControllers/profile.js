const addressModel = require("../../models/addressModel");
const orderModel = require("../../models/orderModel");
const productModel = require("../../models/productModel");
const userModel = require("../../models/userModel");

const loadUserProfile = async (req, res) => {
    try {
        const loggedIn = req.cookies.loggedIn
        const user = await userModel.findOne({ email: req.user })
        const address = await addressModel.findOne({ userId: user._id })
        const orders = await orderModel.find({ userId: user._id })
            .populate({
                path: "products.productId",
                model: "Product"
            }).exec()
        res.render("user/userProfile", { loggedIn, user, address, orders })
    } catch (error) {
        console.log(error);
    }
};

const loadAddAddress = async (req, res) => {
    try {
        const loggedIn = req.cookies.loggedIn
        const { isCheckout } = req.query
        if (!isCheckout === "true") {
            isCheckout = null
        }
        res.render("user/addAddress", { loggedIn, isCheckout })
    } catch (error) {
        console.log(error);
    }
}

const submitAddress = async (req, res) => {
    try {
        const { phone, pincode, state, landMark, city, name, addressType } = req.body
        console.log(req.body);
        const { isCheckout } = req.query
        const user = await userModel.findOne({ email: req.user }, { _id: 1 })
        const userAddress = await addressModel.findOne({ userId: user })
        if (!userAddress) {
            const newAddress = new addressModel({
                userId: user,
                address: [{
                    addressType,
                    name,
                    city,
                    landMark,
                    state,
                    pincode,
                    phone
                }]
            })
            await newAddress.save()
        } else {
            userAddress.address.push({
                addressType,
                name,
                city,
                landMark,
                state,
                pincode,
                phone
            })
            await userAddress.save()
            if (isCheckout === "true") {
                res.redirect("/user/checkout")
            } else {
                res.redirect("/user/profile")
            }
        }
    } catch (error) {
        console.log(error);
    }
}

const loadEditAddress = async (req, res) => {
    try {
        const addressId = req.params.id
        const userEmail = req.user
        // const userId = await userModel.findOne({ email: userEmail }, { _id: 1 })
        const address = await addressModel.findOne({ "address._id": addressId }, { address: { $elemMatch: { _id: addressId } } });
        const loggedIn = req.cookies.loggedIn
        res.render("user/editAddress", { loggedIn, address })
    } catch (error) {
        console.log(error);
    }
}

const postEditAddress = async (req, res) => {
    try {
        const { addressType, name, city, landMark, state, pincode, phone } = req.body
        const addressId = req.params.id
        const currAddress = await addressModel.findOne({ "address._id": addressId })
        console.log(addressId);
        console.log(currAddress);
        if (currAddress && currAddress.address) {
            const matchingAddress = currAddress.address.find(
                (item) => item._id == addressId
            )
            if (matchingAddress) {
                await addressModel.updateOne({ "address._id": addressId }, {
                    $set: {
                        "address.$": {
                            addressType,
                            name,
                            city,
                            landMark,
                            state,
                            pincode,
                            phone
                        }
                    }
                })
                    .then(() => {
                        res.redirect("/user/profile")
                    });
            }
            res.redirect("/user/profile")
        } else {
            res.redirect("/user/profile")
        }
    } catch (error) {
        console.log(error);
    }
}

const deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.id
        const userData = await userModel.findOne({ email: req.user })
        const deletedAddress = await addressModel.updateOne({ userId: userData._id }, { $pull: { address: { _id: addressId } } })
        res.redirect("/user/profile")
    } catch (error) {
        console.log(error);
    }
}


const loadOrderDetails = async (req, res) => {
    try {
        const orderRefId = req.query.orderRefId
        const loggedIn = req.cookies.loggedIn
        const orderDetails = await orderModel.findOne({ referenceId: orderRefId })
            .populate({
                path: "products.productId",
                model: "Product"
            })
        console.log(orderDetails);
        console.log(orderRefId);
        res.render("user/orderDetails", { loggedIn, orderDetails })
    } catch (error) {
        console.log(error);
    }
}

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id
        const userData = await userModel.findOne({ email: req.user })
        const userOrder = await orderModel.findOne({ userId: userData._id })
        let cancelledOrder = await orderModel.findOne({ _id: orderId })
        console.log(cancelledOrder);
        await orderModel.updateOne({ _id: orderId }, { $set: { orderStatus: "Cancelled" } })
        for (const item of cancelledOrder.products) {
            await productModel.updateOne({ _id: item.productId }, {
                $inc: { stock: item.quantity }
            })
        }
        res.redirect(`/user/order-status-details?orderRefId=${cancelledOrder.referenceId}`)
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadUserProfile,
    loadAddAddress,
    submitAddress,
    loadEditAddress,
    postEditAddress,
    deleteAddress,
    loadOrderDetails,
    cancelOrder
}